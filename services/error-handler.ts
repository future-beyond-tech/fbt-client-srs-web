import axios, { type AxiosError } from "axios";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import type { ApiValidationErrorResponse } from "@/types/api";

export class ApiServiceError extends Error {
  status: number;
  details?: ApiValidationErrorResponse;

  constructor(message: string, status = 500, details?: ApiValidationErrorResponse) {
    super(message);
    this.name = "ApiServiceError";
    this.status = status;
    this.details = details;
  }
}

export function isRequestCanceled(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (axios.isCancel(error)) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; name?: string; message?: string };
  return (
    maybeError.code === "ERR_CANCELED" ||
    maybeError.name === "CanceledError" ||
    maybeError.message === "canceled"
  );
}

export function normalizeApiError(error: unknown, fallbackMessage: string): ApiServiceError {
  if (error instanceof ApiServiceError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiValidationErrorResponse>;
  const status = axiosError.response?.status ?? 500;
  const payload = axiosError.response?.data;
  const message =
    payload?.message ||
    payload?.title ||
    axiosError.message ||
    fallbackMessage;

  return new ApiServiceError(message, status, payload);
}

type HandleApiRequestOptions = {
  successMessage?: string;
  errorMessage?: string;
  silent?: boolean;
};

export async function handleApiRequest<T>(
  request: () => Promise<T>,
  options: HandleApiRequestOptions = {},
): Promise<T> {
  const { successMessage, errorMessage = "Request failed.", silent = false } = options;

  try {
    const result = await request();
    if (!silent && successMessage) {
      showSuccessToast(successMessage);
    }
    return result;
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error;
    }

    const normalized = normalizeApiError(error, errorMessage);
    if (!silent) {
      showErrorToast(normalized.message);
    }
    throw normalized;
  }
}
