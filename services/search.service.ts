import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import type { SearchResultDto } from "@/types/api";
import type { SearchResult } from "@/types/search";

const MAX_SEARCH_RESULTS = 50;

function mapSearchResult(dto: SearchResultDto): SearchResult {
  const brand = dto.brand?.trim() || "";
  const model = dto.model?.trim() || "";
  const fallbackVehicle = `${brand} ${model}`.trim();

  return {
    billNumber: String(dto.billNumber ?? ""),
    customerName: dto.customerName || "",
    customerPhone: dto.customerPhone || "",
    vehicle: dto.vehicle || fallbackVehicle || "-",
    registrationNumber: dto.registrationNumber || "",
    saleDate: dto.saleDate || "",
  };
}

export async function search(keyword: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword.length < 2) {
    return [];
  }

  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = {
        signal,
        params: { q: trimmedKeyword },
      };
      const response = await api.get<SearchResultDto[]>("/api/search", config);
      const list = Array.isArray(response.data) ? response.data : [];
      return list
        .map(mapSearchResult)
        .filter((item) => item.billNumber.trim().length > 0)
        .slice(0, MAX_SEARCH_RESULTS);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch search results.",
    },
  );
}
