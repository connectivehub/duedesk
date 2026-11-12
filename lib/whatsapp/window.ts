const WINDOW_MS = 24 * 60 * 60 * 1000;

export function isCustomerWindowOpen(lastCustomerMessageAt: string | null, now: Date = new Date()): boolean {
  if (!lastCustomerMessageAt) return false;
  const then = new Date(lastCustomerMessageAt).getTime();
  if (Number.isNaN(then)) return false;
  const elapsed = now.getTime() - then;
  return elapsed >= 0 && elapsed < WINDOW_MS;
}
