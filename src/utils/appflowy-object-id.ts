// AppFlowy API upserts use the first 16 SHA-256 bytes as a row ID, without
// rewriting UUID version/variant bits. Preserve those bytes: RFC-only UUID
// parsers reject real rows, and replacing their namespace loses document IDs.
// This is an object-ID codec, not an auth/user/session UUID validator.
const OBJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isAppFlowyObjectId(value: unknown): value is string {
  return typeof value === 'string' && value.length === 36 && OBJECT_ID.test(value);
}

export function parseAppFlowyObjectId(value: string): Uint8Array {
  if (!isAppFlowyObjectId(value)) throw new TypeError('Invalid AppFlowy object ID');
  const hex = value.replace(/-/g, '');

  return Uint8Array.from({ length: 16 }, (_, index) => parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}

export function stringifyAppFlowyObjectId(bytes: Uint8Array): string {
  if (bytes.length !== 16) throw new TypeError('AppFlowy object ID must contain 16 bytes');
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
