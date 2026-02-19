export type LoginRequestDto = {
  username: string;
  password: string;
};

export type LoginResponseDto = {
  token: string;
};

export type PurchaseCreateDto = {
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  sellingPrice: number;
  sellerName: string;
  sellerPhone: string;
  sellerAddress?: string;
  buyingCost: number;
  expense: number;
  purchaseDate: string;
};

export type PurchaseCreateResponseDto = {
  vehicleId: number;
};

export type PurchaseResponseDto = {
  id: number;
  vehicleId: number;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  sellingPrice: number;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  buyingCost: number;
  expense: number;
  purchaseDate: string;
  createdAt: string;
};

export type VehicleResponseDto = {
  id: number;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  sellingPrice?: number;
  status: number;
  createdAt?: string;
};

export type SaleCreateDto = {
  VehicleId: number;
  CustomerName: string;
  CustomerPhone: string;
  CustomerAddress?: string;
  PaymentMode: number;
  CashAmount?: number;
  UpiAmount?: number;
  FinanceAmount?: number;
  FinanceCompany?: string;
  SaleDate: string;
};

export type SaleCreateResponseDto = {
  billNumber: number;
  profit: number;
};

export type SaleVehicleDetailsDto = {
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  sellingPrice: number;
};

export type SaleCustomerDetailsDto = {
  name: string;
  phone: string;
  address: string;
  photoUrl?: string;
};

export type SalePaymentDetailsDto = {
  paymentMode: number;
  cashAmount?: number;
  upiAmount?: number;
  financeAmount?: number;
  financeCompany?: string;
  totalReceived?: number;
};

export type SaleByBillResponseDto = {
  billNumber: number;
  vehicleDetails?: SaleVehicleDetailsDto;
  customerDetails?: SaleCustomerDetailsDto;
  paymentDetails?: SalePaymentDetailsDto;
  profit: number;
  saleDate?: string;
};

export type DashboardResponseDto = {
  totalVehiclesPurchased: number;
  totalVehiclesSold: number;
  availableVehicles: number;
  totalProfit: number;
  salesThisMonth: number;
};

export type SearchResultDto = {
  billNumber?: number | string;
  customerName?: string;
  customerPhone?: string;
  vehicle?: string;
  brand?: string;
  model?: string;
  registrationNumber?: string;
  saleDate?: string;
};

export type UploadResponseDto = {
  url: string;
};

export type ApiValidationErrorResponse = {
  status?: number;
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
};
