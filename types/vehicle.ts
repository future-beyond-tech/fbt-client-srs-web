import type { VehicleStatus } from "@/types/enums";

export type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  sellingPrice: number;
  status: VehicleStatus;
  createdAt: string;
};
