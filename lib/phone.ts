export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function formatPhone(digits: string): string {
  if (digits.startsWith("65") && digits.length === 10) {
    return `+65 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 0) return digits;
  return `+${digits}`;
}
