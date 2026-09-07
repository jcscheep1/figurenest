export type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  advertising: boolean;
};

export const CONSENT_STORAGE_KEY = 'figurenest-consent-v1';
export const CONSENT_CHANGED_EVENT = 'figurenest:consent-changed';
const CONSENT_COOKIE_KEY = 'figurenest_consent';
export const CONSENT_MAX_AGE_DAYS = 180;
const CONSENT_MAX_AGE_SECONDS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;

export type StoredConsent = { analytics: boolean; expiresAt: number };

export const defaultConsent: ConsentPreferences = {
  essential: true,
  analytics: false,
  advertising: false,
};

export function parseStoredConsent(saved: string, now = Date.now()): ConsentPreferences | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(saved)) as StoredConsent;
    if (!Object.keys(parsed).every((key) => key === 'analytics' || key === 'expiresAt')) return null;
    if (
      typeof parsed.expiresAt !== 'number'
      || !Number.isFinite(parsed.expiresAt)
      || parsed.expiresAt <= now
      || parsed.expiresAt > now + CONSENT_MAX_AGE_SECONDS * 1000
    ) return null;
    return {
      essential: true,
      analytics: parsed.analytics === true,
      advertising: false,
    };
  } catch {
    return null;
  }
}

export function createStoredConsent(preferences: ConsentPreferences, now = Date.now()): StoredConsent {
  return {
    analytics: preferences.analytics === true,
    expiresAt: now + CONSENT_MAX_AGE_SECONDS * 1000,
  };
}

export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY)
      ?? document.cookie
        .split('; ')
        .find((item) => item.startsWith(`${CONSENT_COOKIE_KEY}=`))
        ?.slice(CONSENT_COOKIE_KEY.length + 1);
    if (!saved) return null;
    const parsed = parseStoredConsent(saved);
    if (!parsed) {
      clearStoredConsent();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  const stored = createStoredConsent(preferences);
  const serialized = JSON.stringify(stored);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
  try {
    document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch {
    // Cookies can be unavailable in restricted browser contexts.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: { ...preferences, advertising: false } }));
}

function clearStoredConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.cookie = `${CONSENT_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function clearAccessibleGaCookies(): void {
  if (typeof document === 'undefined') return;
  const names = document.cookie
    .split(';')
    .map((item) => item.trim().split('=')[0])
    .filter((name) => /^_ga(?:_|$)/.test(name));
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
  const domains = ['', hostname, hostname ? `.${hostname}` : '', '.figurenest.com'];
  for (const name of new Set(names)) {
    for (const domain of new Set(domains)) {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }
}