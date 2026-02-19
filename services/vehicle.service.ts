import { buildApiUrl, fetchWithTimeout, limitResults, parseNumber, parseText } from "@/lib/utils";
import { parseVehicleStatus } from "@/types/enums";
import type { Vehicle } from "@/types/vehicle";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

type RawVehicle = Partial<Vehicle> & {
  id?: number | string;
  year?: number | string;
  sellingPrice?: number | string;
  status?: number | string;
};

const MAX_VEHICLE_RESULTS = 1000;
const MAX_AVAILABLE_VEHICLE_RESULTS = 500;

function normalizeVehicle(item: RawVehicle): Vehicle {
  return {
    id: parseNumber(item.id),
    brand: parseText(item.brand),
    model: parseText(item.model),
    year: parseNumber(item.year),
    registrationNumber: parseText(item.registrationNumber),
    chassisNumber: parseText(item.chassisNumber),
    engineNumber: parseText(item.engineNumber),
    sellingPrice: parseNumber(item.sellingPrice),
    status: parseVehicleStatus(item.status),
    createdAt: parseText(item.createdAt),
  };
}

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

export async function getVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  const response = await fetchWithTimeout(buildApiUrl("/vehicles"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch vehicles.");
  }

  const data = (await response.json()) as RawVehicle[];
  if (!Array.isArray(data)) {
    return [];
  }

  return limitResults(
    data
      .map((item) => normalizeVehicle(item))
      .filter((item) => item.id > 0),
    MAX_VEHICLE_RESULTS,
  );
}

export async function getAvailableVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  const response = await fetchWithTimeout(buildApiUrl("/vehicles/available"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch available vehicles.");
  }

  const data = (await response.json()) as RawVehicle[];
  if (!Array.isArray(data)) {
    return [];
  }

  return limitResults(
    data
      .map((item) => normalizeVehicle(item))
      .filter((item) => item.id > 0),
    MAX_AVAILABLE_VEHICLE_RESULTS,
  );
}
