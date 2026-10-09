import { readStorage, writeStorage } from './storage';

// Where to send someone after they sign in, e.g. back to /join/ABC123.
// Kept in the URL (?next=) for email auth and in sessionStorage to survive
// the Google OAuth round trip, which always lands back on the site root.

const KEY = 'bigdogs.next';

/** Only same-site absolute paths; rejects "//evil.com" and full URLs. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export function rememberNextPath(path: string | null): void {
  writeStorage(KEY, safeNextPath(path), 'session');
}

/** Returns the stored path once, then clears it. */
export function consumeNextPath(): string | null {
  const value = safeNextPath(readStorage(KEY, 'session'));
  writeStorage(KEY, null, 'session');
  return value;
}

export function withNext(path: string, next: string | null): string {
  const safe = safeNextPath(next);
  return safe ? `${path}?next=${encodeURIComponent(safe)}` : path;
}
