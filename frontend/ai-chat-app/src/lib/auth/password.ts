export const MAX_PASSWORD_BYTES = 72;
export const MIN_PASSWORD_LENGTH = 8;

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function validatePassword(value: string): string | null {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }

  if (getUtf8ByteLength(value) > MAX_PASSWORD_BYTES) {
    return `Password must be ${MAX_PASSWORD_BYTES} bytes or fewer`;
  }

  return null;
}
