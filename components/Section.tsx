type Props = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

export function Section({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 border-b ledger-rule py-10 last:border-b-0">
      <h2 className="mb-5 font-serif text-xl sm:text-2xl">{title}</h2>
      <div className="space-y-4 text-ink-muted">{children}</div>
    </section>
  );
}
