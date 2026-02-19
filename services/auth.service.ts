import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/token-storage";
import type { LoginRequestDto, LoginResponseDto } from "@/types/api";

export async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return handleApiRequest(
    async () => {
      const response = await api.post<LoginResponseDto>("/api/auth/login", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const token = response.data?.token?.trim();
      if (!token) {
        throw new Error("Token not returned by server.");
      }

      setAccessToken(token);
      return { token };
    },
    {
      successMessage: "Login successful.",
      errorMessage: "Invalid username or password.",
    },
  );
}

export async function logout(): Promise<void> {
  await handleApiRequest(
    async () => {
      try {
        await api.post("/api/auth/logout");
      } finally {
        clearAccessToken();
      }
    },
    {
      successMessage: "Logged out.",
      errorMessage: "Failed to logout.",
    },
  );
}

export async function getCurrentUser(): Promise<Record<string, unknown> | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  return handleApiRequest(
    async () => {
      const response = await api.get<Record<string, unknown>>("/api/auth/me");
      return response.data;
    },
    {
      silent: true,
      errorMessage: "Unable to validate session.",
    },
  );
}
