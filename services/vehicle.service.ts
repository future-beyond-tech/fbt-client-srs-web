import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import { parseVehicleStatus } from "@/types/enums";
import type { Vehicle } from "@/types/vehicle";
import type { VehicleResponseDto } from "@/types/api";

const MAX_VEHICLE_RESULTS = 1000;
const MAX_AVAILABLE_VEHICLE_RESULTS = 500;

function mapVehicle(dto: VehicleResponseDto): Vehicle {
  return {
    id: Number(dto.id) || 0,
    brand: dto.brand || "",
    model: dto.model || "",
    year: Number(dto.year) || 0,
    registrationNumber: dto.registrationNumber || "",
    chassisNumber: dto.chassisNumber || "",
    engineNumber: dto.engineNumber || "",
    sellingPrice: Number(dto.sellingPrice) || 0,
    status: parseVehicleStatus(dto.status),
    createdAt: dto.createdAt || "",
  };
}

export async function getVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<VehicleResponseDto[]>("/api/vehicles", config);
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map(mapVehicle).filter((item) => item.id > 0).slice(0, MAX_VEHICLE_RESULTS);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch vehicles.",
    },
  );
}

export async function getAvailableVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<VehicleResponseDto[]>("/api/vehicles/available", config);
      const list = Array.isArray(response.data) ? response.data : [];
      return list
        .map(mapVehicle)
        .filter((item) => item.id > 0)
        .slice(0, MAX_AVAILABLE_VEHICLE_RESULTS);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch available vehicles.",
    },
  );
}
