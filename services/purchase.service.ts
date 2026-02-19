import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import type {
  PurchaseCreateDto,
  PurchaseCreateResponseDto,
  PurchaseResponseDto,
} from "@/types/api";
import type { CreatePurchaseInput, Purchase } from "@/types/purchase";

function toCreatePurchaseDto(input: CreatePurchaseInput): PurchaseCreateDto {
  return {
    brand: input.brand,
    model: input.model,
    year: input.year,
    registrationNumber: input.registrationNumber,
    chassisNumber: input.chassisNumber || "",
    engineNumber: input.engineNumber || "",
    sellingPrice: input.sellingPrice,
    sellerName: input.sellerName,
    sellerPhone: input.sellerPhone,
    sellerAddress: input.sellerAddress || "",
    buyingCost: input.buyingCost,
    expense: input.expense,
    purchaseDate: input.purchaseDate,
  };
}

function mapPurchase(dto: PurchaseResponseDto): Purchase {
  return {
    id: Number(dto.id) || 0,
    vehicleId: Number(dto.vehicleId) || 0,
    brand: dto.brand || "",
    model: dto.model || "",
    year: Number(dto.year) || 0,
    registrationNumber: dto.registrationNumber || "",
    sellingPrice: Number(dto.sellingPrice) || 0,
    sellerName: dto.sellerName || "",
    sellerPhone: dto.sellerPhone || "",
    sellerAddress: dto.sellerAddress || "",
    buyingCost: Number(dto.buyingCost) || 0,
    expense: Number(dto.expense) || 0,
    purchaseDate: dto.purchaseDate || "",
    createdAt: dto.createdAt || "",
  };
}

export async function createPurchase(payload: CreatePurchaseInput): Promise<Purchase> {
  return handleApiRequest(
    async () => {
      const dto = toCreatePurchaseDto(payload);
      const response = await api.post<PurchaseResponseDto | PurchaseCreateResponseDto>(
        "/api/purchases",
        dto,
      );

      if ("vehicleId" in response.data && !("id" in response.data)) {
        const created = response.data as PurchaseCreateResponseDto;
        return {
          id: 0,
          vehicleId: Number(created.vehicleId) || 0,
          brand: payload.brand,
          model: payload.model,
          year: payload.year,
          registrationNumber: payload.registrationNumber,
          sellingPrice: payload.sellingPrice,
          sellerName: payload.sellerName,
          sellerPhone: payload.sellerPhone,
          sellerAddress: payload.sellerAddress || "",
          buyingCost: payload.buyingCost,
          expense: payload.expense,
          purchaseDate: payload.purchaseDate,
          createdAt: "",
        };
      }

      return mapPurchase(response.data as PurchaseResponseDto);
    },
    {
      successMessage: "Purchase created successfully.",
      errorMessage: "Unable to create purchase.",
    },
  );
}

export async function getPurchases(signal?: AbortSignal): Promise<Purchase[]> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<PurchaseResponseDto[]>("/api/purchases", config);
      return (Array.isArray(response.data) ? response.data : [])
        .map(mapPurchase)
        .filter((item) => item.id > 0);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch purchases.",
    },
  );
}

export async function getPurchaseById(id: number, signal?: AbortSignal): Promise<Purchase> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<PurchaseResponseDto>(`/api/purchases/${id}`, config);
      return mapPurchase(response.data);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch purchase details.",
    },
  );
}
