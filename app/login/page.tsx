"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/utils";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  token?: string;
  message?: string;
};

const TEST_USERNAME = "admin";
const TEST_PASSWORD = "admin123";
const TEST_TOKEN = "test-token";

function setClientToken(token: string) {
  document.cookie = `token=${token}; Path=/; Max-Age=28800; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<LoginPayload>({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = values.username.trim();
    const password = values.password.trim();

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (username === TEST_USERNAME && password === TEST_PASSWORD) {
      setClientToken(TEST_TOKEN);
      router.replace("/dashboard");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        setError(payload.message || "Invalid username or password.");
        return;
      }

      if (payload.token) {
        setClientToken(payload.token);
      }

      router.replace("/dashboard");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-500">
              LOGO
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">SRS Dealership Admin</h1>
            <p className="mt-1 text-sm text-gray-700">Secure Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={values.username}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, username: event.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-16 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Test: <span className="font-semibold">admin</span> /{" "}
              <span className="font-semibold">admin123</span>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
