-- WhatsApp ordering state, payments, and private document storage.
-- The Data API is locked down: RLS is on and anon/authenticated have no policies.
-- Server routes use the service role key, which bypasses RLS.

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
revoke all on function private.set_updated_at() from public, anon, authenticated;
grant execute on function private.set_updated_at() to service_role;

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  profile_name text,
  state text not null default 'greeting',
  state_before_handoff text,
  company_name text,
  uen text,
  years text[] not null default '{}',
  rush boolean not null default false,
  quote_cents integer,
  stripe_checkout_session_id text,
  order_id uuid,
  file_count integer not null default 0,
  done_confirm_pending boolean not null default false,
  checklist_sent boolean not null default false,
  handoff_reason text,
  last_customer_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_conversations_state_check check (
    state in (
      'greeting',
      'collect_years',
      'collect_speed',
      'confirm_quote',
      'awaiting_payment',
      'collect_documents',
      'in_prep',
      'pack_sent',
      'completed',
      'needs_leon'
    )
  )
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations (id),
  phone text not null,
  company_name text,
  uen text,
  years text[] not null default '{}',
  rush boolean not null default false,
  amount_cents integer not null,
  currency text not null default 'sgd',
  status text not null default 'awaiting_payment',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  checkout_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('awaiting_payment', 'paid', 'in_prep', 'pack_sent', 'completed', 'cancelled')
  )
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.whatsapp_conversations (id),
  phone text,
  wa_message_id text unique,
  direction text not null,
  message_type text,
  body text,
  created_at timestamptz not null default now(),
  constraint whatsapp_messages_direction_check check (
    direction in ('inbound', 'outbound', 'echo', 'history')
  )
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id),
  conversation_id uuid references public.whatsapp_conversations (id),
  storage_path text not null,
  mime_type text,
  filename text,
  wa_media_id text,
  bytes integer,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_webhook_events (
  id uuid primary key default gen_random_uuid(),
  field text not null,
  phone text,
  summary text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_conversation_id_idx on public.orders (conversation_id);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists whatsapp_messages_conversation_id_idx on public.whatsapp_messages (conversation_id);
create index if not exists whatsapp_messages_phone_idx on public.whatsapp_messages (phone);
create index if not exists order_files_order_id_idx on public.order_files (order_id);
create index if not exists whatsapp_webhook_events_field_idx on public.whatsapp_webhook_events (field);

drop trigger if exists whatsapp_conversations_set_updated_at on public.whatsapp_conversations;
create trigger whatsapp_conversations_set_updated_at
before update on public.whatsapp_conversations
for each row execute function private.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function private.set_updated_at();

alter table public.whatsapp_conversations enable row level security;
alter table public.orders enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.order_files enable row level security;
alter table public.whatsapp_webhook_events enable row level security;
alter table public.stripe_events enable row level security;

revoke all on table public.whatsapp_conversations from public, anon, authenticated;
revoke all on table public.orders from public, anon, authenticated;
revoke all on table public.whatsapp_messages from public, anon, authenticated;
revoke all on table public.order_files from public, anon, authenticated;
revoke all on table public.whatsapp_webhook_events from public, anon, authenticated;
revoke all on table public.stripe_events from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-documents',
  'order-documents',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
