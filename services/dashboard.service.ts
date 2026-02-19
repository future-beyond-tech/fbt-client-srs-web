import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import type { DashboardResponseDto } from "@/types/api";

export type DashboardSummary = {
  totalVehiclesPurchased: number;
  totalVehiclesSold: number;
  availableVehicles: number;
  totalProfit: number;
  salesThisMonth: number;
};

function mapDashboardSummary(dto: DashboardResponseDto): DashboardSummary {
  return {
    totalVehiclesPurchased: Number(dto.totalVehiclesPurchased) || 0,
    totalVehiclesSold: Number(dto.totalVehiclesSold) || 0,
    availableVehicles: Number(dto.availableVehicles) || 0,
    totalProfit: Number(dto.totalProfit) || 0,
    salesThisMonth: Number(dto.salesThisMonth) || 0,
  };
}

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<DashboardResponseDto>("/api/dashboard", config);
      return mapDashboardSummary(response.data);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch dashboard summary.",
    },
  );
}
