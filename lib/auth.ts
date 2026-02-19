import { buildApiUrl } from "@/lib/utils";

type AuthUser = Record<string, unknown>;

function clearClientTokenCookie() {
  if (typeof window !== "undefined") {
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
  }
}

export async function checkAuth(): Promise<AuthUser | null> {
  try {
    const response = await fetch(buildApiUrl("/auth/me"), {
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

    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(buildApiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearClientTokenCookie();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }
}
