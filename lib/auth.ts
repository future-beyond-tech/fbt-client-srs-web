const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function checkAuth(): Promise<Record<string, unknown> | null> {
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

    return (await response.json()) as Record<string, unknown>;
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

  void fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  });
}
