import { buildApiUrl, fetchWithTimeout, parseNumber, parseText } from "@/lib/utils";
import { PAYMENT_MODE, parsePaymentMode } from "@/types/enums";
import type { CreateSaleInput, CreateSaleResponse, SaleDetails } from "@/types/sale";

type ApiErrorResponse = {
  message?: string;
  title?: string;
};

type RawSaleResponse = Partial<CreateSaleResponse> & {
  billNo?: string | number;
  invoiceNumber?: string | number;
};

type RawSaleDetails = Partial<SaleDetails> & {
  billNumber?: string | number;
  billNo?: string | number;
  vehicleId?: number | string;
  vehicle?: unknown;
  customerName?: string;
  totalReceived?: number | string;
  saleDate?: string;
  profit?: number | string;
  paymentMode?: number | string;
  cashAmount?: number | string | null;
  upiAmount?: number | string | null;
  financeAmount?: number | string | null;
  financeCompany?: string | null;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    photoUrl?: string;
  };
  registrationNumber?: string;
};

function normalizeSaleDetails(payload: RawSaleDetails): SaleDetails {
  const vehicleSource =
    payload.vehicle && typeof payload.vehicle === "object"
      ? (payload.vehicle as Record<string, unknown>)
      : null;
  const customerSource =
    payload.customer && typeof payload.customer === "object"
      ? payload.customer
      : null;

  const vehicleLabel = parseText(payload.vehicle);
  const billNumber = parseText(payload.billNumber ?? payload.billNo);
  const saleDate = parseText(payload.saleDate);
  const paymentMode = parsePaymentMode(payload.paymentMode);
  const cashAmount = parseNumber(payload.cashAmount);
  const upiAmount = parseNumber(payload.upiAmount);
  const financeAmount = parseNumber(payload.financeAmount);
  const totalReceived = parseNumber(payload.totalReceived);

  return {
    billNumber,
    vehicleId: parseNumber(payload.vehicleId),
    vehicleLabel,
    customerName: parseText(payload.customerName ?? customerSource?.name),
    totalReceived:
      totalReceived > 0
        ? totalReceived
        : paymentMode === PAYMENT_MODE.Cash
          ? cashAmount
          : paymentMode === PAYMENT_MODE.Upi
            ? upiAmount
            : cashAmount + upiAmount + financeAmount,
    saleDate,
    profit: parseNumber(payload.profit),
    paymentMode,
    cashAmount,
    upiAmount,
    financeAmount,
    financeCompany: parseText(payload.financeCompany),
    vehicle: {
      brand: parseText(vehicleSource?.brand),
      model: parseText(vehicleSource?.model),
      year: parseNumber(vehicleSource?.year),
      registrationNumber: parseText(
        vehicleSource?.registrationNumber ?? payload.registrationNumber,
      ),
      chassisNumber: parseText(vehicleSource?.chassisNumber),
      engineNumber: parseText(vehicleSource?.engineNumber),
      sellingPrice: parseNumber(vehicleSource?.sellingPrice),
    },
    customer: {
      name: parseText(customerSource?.name ?? payload.customerName),
      phone: parseText(customerSource?.phone),
      address: parseText(customerSource?.address),
      photoUrl: parseText(customerSource?.photoUrl),
    },
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

export async function createSale(payload: CreateSaleInput): Promise<CreateSaleResponse> {
  const response = await fetchWithTimeout(buildApiUrl("/sales"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    timeout: 8000,
  });

  if (!response.ok) {
    throw await parseError(response, "Unable to create sale.");
  }

  const data = (await response.json()) as RawSaleResponse;
  const billNumber = parseText(data.billNumber ?? data.billNo ?? data.invoiceNumber);

  if (!billNumber) {
    throw new Error("Sale created but bill number was not returned.");
  }

  return { billNumber };
}

export async function getSaleByBillNumber(
  billNumber: string,
  signal?: AbortSignal,
): Promise<SaleDetails> {
  const response = await fetchWithTimeout(
    buildApiUrl(`/sales/${encodeURIComponent(billNumber)}`),
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
      timeout: 8000,
    },
  );

  if (!response.ok) {
    throw await parseError(response, "Unable to fetch bill details.");
  }

  const data = (await response.json()) as RawSaleDetails;
  return normalizeSaleDetails(data);
}
