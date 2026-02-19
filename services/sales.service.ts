import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { handleApiRequest } from "@/services/error-handler";
import { PAYMENT_MODE, parsePaymentMode } from "@/types/enums";
import type {
  SaleByBillResponseDto,
  SaleCreateDto,
  SaleCreateResponseDto,
  SaleCustomerDetailsDto,
  SalePaymentDetailsDto,
  SaleVehicleDetailsDto,
} from "@/types/api";
import type { CreateSaleInput, CreateSaleResponse, SaleDetails } from "@/types/sale";

function mapCreateSaleDto(input: CreateSaleInput): SaleCreateDto {
  return {
    VehicleId: input.vehicleId,
    CustomerName: input.customerName,
    CustomerPhone: input.customerPhone,
    CustomerAddress: input.customerAddress || "",
    PaymentMode: input.paymentMode,
    CashAmount: input.cashAmount || 0,
    UpiAmount: input.upiAmount || 0,
    FinanceAmount: input.financeAmount || 0,
    FinanceCompany: input.financeCompany || "",
    SaleDate: input.saleDate || new Date().toISOString(),
  };
}

function mapVehicleDetails(dto?: SaleVehicleDetailsDto): SaleDetails["vehicle"] {
  return {
    brand: dto?.brand || "",
    model: dto?.model || "",
    year: Number(dto?.year) || 0,
    registrationNumber: dto?.registrationNumber || "",
    chassisNumber: dto?.chassisNumber || "",
    engineNumber: dto?.engineNumber || "",
    sellingPrice: Number(dto?.sellingPrice) || 0,
  };
}

function mapCustomerDetails(dto?: SaleCustomerDetailsDto): SaleDetails["customer"] {
  return {
    name: dto?.name || "",
    phone: dto?.phone || "",
    address: dto?.address || "",
    photoUrl: dto?.photoUrl || "",
  };
}

function mapSaleDetails(dto: SaleByBillResponseDto): SaleDetails {
  const payment = dto.paymentDetails as SalePaymentDetailsDto | undefined;
  const mode = parsePaymentMode(payment?.paymentMode);
  const cashAmount = Number(payment?.cashAmount) || 0;
  const upiAmount = Number(payment?.upiAmount) || 0;
  const financeAmount = Number(payment?.financeAmount) || 0;
  const totalReceived =
    Number(payment?.totalReceived) ||
    (mode === PAYMENT_MODE.Cash
      ? cashAmount
      : mode === PAYMENT_MODE.Upi
        ? upiAmount
        : mode === PAYMENT_MODE.Finance
          ? financeAmount
          : cashAmount + upiAmount + financeAmount);

  const vehicle = mapVehicleDetails(dto.vehicleDetails);
  const customer = mapCustomerDetails(dto.customerDetails);

  return {
    billNumber: String(dto.billNumber || ""),
    vehicleId: 0,
    vehicleLabel: `${vehicle.brand} ${vehicle.model}`.trim(),
    customerName: customer.name,
    totalReceived,
    saleDate: dto.saleDate || "",
    profit: Number(dto.profit) || 0,
    paymentMode: mode,
    cashAmount,
    upiAmount,
    financeAmount,
    financeCompany: payment?.financeCompany || "",
    vehicle,
    customer,
  };
}

export async function createSale(payload: CreateSaleInput): Promise<CreateSaleResponse> {
  return handleApiRequest(
    async () => {
      const dto = mapCreateSaleDto(payload);
      const response = await api.post<SaleCreateResponseDto>("/api/sales", dto);
      const billNumber = Number(response.data?.billNumber);

      if (!billNumber) {
        throw new Error("Sale created but bill number was not returned.");
      }

      return {
        billNumber: String(billNumber),
      };
    },
    {
      successMessage: "Sale created successfully.",
      errorMessage: "Unable to create sale.",
    },
  );
}

export async function getSaleByBillNumber(
  billNumber: string,
  signal?: AbortSignal,
): Promise<SaleDetails> {
  return handleApiRequest(
    async () => {
      const config: AxiosRequestConfig = { signal };
      const response = await api.get<SaleByBillResponseDto>(`/api/sales/${billNumber}`, config);
      return mapSaleDetails(response.data);
    },
    {
      silent: true,
      errorMessage: "Unable to fetch bill details.",
    },
  );
}
