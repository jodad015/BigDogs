// Browser storage can throw (private mode, blocked site data), so every access
// is wrapped. Only use this for conveniences that are fine to lose.

export function readStorage(key: string, store: 'local' | 'session' = 'local'): string | null {
  try {
    return (store === 'local' ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(
  key: string,
  value: string | null,
  store: 'local' | 'session' = 'local',
): void {
  try {
    const s = store === 'local' ? localStorage : sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    // ignore
  }
}

const LAST_ORG_KEY = 'bigdogs.lastOrg';

export const lastOrgSlug = {
  get: () => readStorage(LAST_ORG_KEY),
  set: (slug: string | null) => writeStorage(LAST_ORG_KEY, slug),
};
