export function redactPrivateContext(value: string, privacyMode: boolean): string {
  if (!privacyMode) return value;
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[private email]");
}
