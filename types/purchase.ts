export type CreatePurchaseInput = {
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

export type Purchase = {
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
