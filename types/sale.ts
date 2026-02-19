import type { PaymentMode } from "@/types/enums";

export type CreateSaleInput = {
  vehicleId: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerPhotoUrl?: string;
  paymentMode: PaymentMode;
  cashAmount?: number;
  upiAmount?: number;
  financeAmount?: number;
  financeCompany?: string;
  saleDate?: string;
};

export type CreateSaleResponse = {
  billNumber: string;
};

export type SaleVehicleDetails = {
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  sellingPrice: number;
};

export type SaleCustomerDetails = {
  name: string;
  phone: string;
  address: string;
  photoUrl: string;
};

export type SaleDetails = {
  billNumber: string;
  vehicleId: number;
  vehicleLabel: string;
  customerName: string;
  totalReceived: number;
  saleDate: string;
  profit: number;
  vehicle: SaleVehicleDetails;
  customer: SaleCustomerDetails;
  paymentMode: PaymentMode;
  cashAmount: number;
  upiAmount: number;
  financeAmount: number;
  financeCompany: string;
};
