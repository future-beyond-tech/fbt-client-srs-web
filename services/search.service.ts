import { buildApiUrl, fetchWithTimeout, limitResults, parseText } from "@/lib/utils";
import type { SearchResult } from "@/types/search";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

type RawSearchResult = Partial<SearchResult> & {
  billNo?: string | number;
  customer?: string;
  name?: string;
  phone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  brand?: string;
  model?: string;
  registrationNo?: string;
  regNo?: string;
  sale_date?: string;
};

const MAX_SEARCH_RESULTS = 50;

function normalizeSearchResult(item: RawSearchResult): SearchResult {
  const vehicleText = parseText(item.vehicle);
  const brand = parseText(item.vehicleBrand ?? item.brand);
  const model = parseText(item.vehicleModel ?? item.model);
  const vehicle = vehicleText || `${brand} ${model}`.trim();

  return {
    billNumber: parseText(item.billNumber ?? item.billNo),
    customerName: parseText(item.customerName ?? item.customer ?? item.name),
    customerPhone: parseText(item.customerPhone ?? item.phone),
    vehicle,
    registrationNumber: parseText(
      item.registrationNumber ?? item.registrationNo ?? item.regNo,
    ),
    saleDate: parseText(item.saleDate ?? item.sale_date),
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

export async function search(keyword: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword.length < 2) {
    return [];
  }

  const response = await fetchWithTimeout(
    buildApiUrl(`/search?q=${encodeURIComponent(trimmedKeyword)}`),
    {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
      timeout: 8000,
    },
  );

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch search results.");
  }

  const data = (await response.json()) as RawSearchResult[];
  if (!Array.isArray(data)) {
    return [];
  }

  return limitResults(
    data
      .map((item) => normalizeSearchResult(item))
      .filter((item) => item.billNumber.trim().length > 0),
    MAX_SEARCH_RESULTS,
  );
}
