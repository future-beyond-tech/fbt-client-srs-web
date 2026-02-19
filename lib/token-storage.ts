const ACCESS_TOKEN_KEY = "srs_access_token";
let inMemoryToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setTokenCookie(token: string) {
  if (!isBrowser()) {
    return;
  }

  const encoded = encodeURIComponent(token);
  document.cookie = `token=${encoded}; Path=/; Max-Age=28800; SameSite=Lax`;
}

function clearTokenCookie() {
  if (!isBrowser()) {
    return;
  }

  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
}

export function getAccessToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  inMemoryToken = token;
  return token;
}

export function setAccessToken(token: string): void {
  inMemoryToken = token;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  setTokenCookie(token);
}

export function clearAccessToken(): void {
  inMemoryToken = null;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  clearTokenCookie();
}
