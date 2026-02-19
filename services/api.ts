import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/token-storage";
import type { ApiValidationErrorResponse } from "@/types/api";

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  return (baseUrl || "").replace(/\/+$/, "");
}

function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function handleUnauthorized(error: AxiosError<ApiValidationErrorResponse>) {
  if (error.response?.status !== 401) {
    return;
  }

  clearAccessToken();

  if (typeof window === "undefined") {
    return;
  }

  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(attachAuthHeader);
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiValidationErrorResponse>) => {
    handleUnauthorized(error);
    return Promise.reject(error);
  },
);
