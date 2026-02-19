type AuthUser = Record<string, unknown>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function checkAuth(): Promise<AuthUser | null> {
  if (!API_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as AuthUser;
    return user;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (!API_URL) {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    return;
  }

  void (async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }
  })();
}
