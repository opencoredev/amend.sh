const maxAuthEmailSearchLength = 320;

export function parseAuthEmailSearch(value: unknown) {
  if (typeof value !== "string") return undefined;

  const email = value.trim().slice(0, maxAuthEmailSearchLength);
  return email || undefined;
}

export function authEmailSearch(email: string) {
  const parsedEmail = parseAuthEmailSearch(email);
  return parsedEmail ? { email: parsedEmail } : {};
}
