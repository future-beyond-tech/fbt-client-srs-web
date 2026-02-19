import { buildApiUrl, fetchWithTimeout, parseNumber, parseText } from "@/lib/utils";
import type { CreatePurchaseInput, Purchase } from "@/types/purchase";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

type RawPurchase = Partial<Purchase> & {
  id?: number | string;
  vehicleId?: number | string;
  year?: number | string;
  sellingPrice?: number | string;
  buyingCost?: number | string;
  expense?: number | string;
};

function normalizePurchase(item: RawPurchase): Purchase {
  return {
    id: parseNumber(item.id),
    vehicleId: parseNumber(item.vehicleId),
    brand: parseText(item.brand),
    model: parseText(item.model),
    year: parseNumber(item.year),
    registrationNumber: parseText(item.registrationNumber),
    sellingPrice: parseNumber(item.sellingPrice),
    sellerName: parseText(item.sellerName),
    sellerPhone: parseText(item.sellerPhone),
    sellerAddress: parseText(item.sellerAddress),
    buyingCost: parseNumber(item.buyingCost),
    expense: parseNumber(item.expense),
    purchaseDate: parseText(item.purchaseDate),
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

export async function createPurchase(payload: CreatePurchaseInput): Promise<Purchase> {
  const response = await fetchWithTimeout(buildApiUrl("/purchases"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to create purchase.");
  }

  const data = (await response.json()) as RawPurchase;
  return normalizePurchase(data);
}

export async function getPurchases(signal?: AbortSignal): Promise<Purchase[]> {
  const response = await fetchWithTimeout(buildApiUrl("/purchases"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch purchases.");
  }

  const data = (await response.json()) as RawPurchase[];
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => normalizePurchase(item)).filter((item) => item.id > 0);
}

export async function getPurchaseById(id: number, signal?: AbortSignal): Promise<Purchase> {
  const response = await fetchWithTimeout(buildApiUrl(`/purchases/${encodeURIComponent(String(id))}`), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch purchase details.");
  }

  const data = (await response.json()) as RawPurchase;
  return normalizePurchase(data);
}
