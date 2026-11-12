import type { Extraction } from "@/lib/whatsapp/extract";

export type FlowState =
  | "greeting"
  | "collect_years"
  | "collect_speed"
  | "confirm_quote"
  | "awaiting_payment"
  | "collect_documents"
  | "in_prep"
  | "pack_sent"
  | "completed"
  | "needs_leon";

export type Conversation = {
  phone: string;
  state: FlowState;
  stateBeforeHandoff: FlowState | null;
  companyName: string | null;
  uen: string | null;
  years: string[];
  rush: boolean;
  quoteCents: number | null;
  fileCount: number;
  doneConfirmPending: boolean;
  checklistSent: boolean;
  handoffReason: string | null;
  lastCustomerMessageAt: string | null;
};

export type MachineEvent =
  | { type: "text"; body: string; at: string; extraction: Extraction }
  | { type: "interactive"; id: string; at: string }
  | { type: "media"; mimeType: string; filename?: string; at: string }
  | { type: "echo"; at: string }
  | { type: "payment_succeeded" }
  | { type: "payment_failed" }
  | { type: "admin_clear" }
  | { type: "admin_pack_ready" }
  | { type: "admin_complete" };

export type ButtonOption = { id: string; title: string };
export type ListRow = { id: string; title: string; description?: string };

export type Outbound =
  | { kind: "text"; body: string }
  | { kind: "buttons"; body: string; buttons: ButtonOption[] }
  | { kind: "list"; body: string; button: string; rows: ListRow[] }
  | { kind: "checklist" }
  | { kind: "template"; name: string; bodyParams: string[] };

export type Effect =
  | { type: "notify_handoff"; reason: string }
  | { type: "create_checkout" }
  | { type: "resend_checkout" }
  | { type: "abandon_checkout" }
  | { type: "store_media" }
  | { type: "mark_paid" }
  | { type: "mark_in_prep" }
  | { type: "mark_pack_sent" }
  | { type: "mark_completed" };

export type StepResult = {
  conversation: Conversation;
  outbound: Outbound[];
  effects: Effect[];
};

export function blankConversation(phone: string): Conversation {
  return {
    phone,
    state: "greeting",
    stateBeforeHandoff: null,
    companyName: null,
    uen: null,
    years: [],
    rush: false,
    quoteCents: null,
    fileCount: 0,
    doneConfirmPending: false,
    checklistSent: false,
    handoffReason: null,
    lastCustomerMessageAt: null,
  };
}
