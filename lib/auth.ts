import {
  getCurrentUser,
  logout as logoutService,
} from "@/services/auth.service";

type AuthUser = Record<string, unknown>;

export async function checkAuth(): Promise<AuthUser | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await logoutService();
  } finally {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }
}
