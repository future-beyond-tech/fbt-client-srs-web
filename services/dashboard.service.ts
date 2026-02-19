import { buildApiUrl, fetchWithTimeout, parseNumber } from "@/lib/utils";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

export type DashboardSummary = {
  totalVehiclesPurchased: number;
  totalVehiclesSold: number;
  availableVehicles: number;
  totalProfit: number;
  salesThisMonth: number;
};

type RawDashboardSummary = Partial<DashboardSummary> & {
  totalVehicles?: number | string;
  soldVehicles?: number | string;
};

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  let message = fallbackMessage;

  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload.message) {
      message = payload.message;
    } else if (payload.title) {
      message = payload.title;
    }
  } catch {
    // Ignore JSON parsing errors for error payloads.
  }

  return new Error(message);
}

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const response = await fetchWithTimeout(buildApiUrl("/dashboard"), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch dashboard summary.");
  }

  const payload = (await response.json()) as RawDashboardSummary;

  return {
    totalVehiclesPurchased: parseNumber(
      payload.totalVehiclesPurchased ?? payload.totalVehicles,
    ),
    totalVehiclesSold: parseNumber(payload.totalVehiclesSold ?? payload.soldVehicles),
    availableVehicles: parseNumber(payload.availableVehicles),
    totalProfit: parseNumber(payload.totalProfit),
    salesThisMonth: parseNumber(payload.salesThisMonth),
  };
}
