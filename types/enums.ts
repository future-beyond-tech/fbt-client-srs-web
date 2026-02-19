export const PAYMENT_MODE = {
  Cash: 1,
  Upi: 2,
  Finance: 3,
  Mixed: 4,
} as const;

export type PaymentMode = (typeof PAYMENT_MODE)[keyof typeof PAYMENT_MODE];

export const VEHICLE_STATUS = {
  Available: 1,
  Sold: 2,
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export function getPaymentModeLabel(mode: PaymentMode | number): string {
  switch (mode) {
    case PAYMENT_MODE.Cash:
      return "Cash";
    case PAYMENT_MODE.Upi:
      return "UPI";
    case PAYMENT_MODE.Finance:
      return "Finance";
    case PAYMENT_MODE.Mixed:
      return "Mixed";
    default:
      return "Cash";
  }
}

export function parsePaymentMode(value: unknown): PaymentMode {
  const mode = Number(value);
  if (
    mode === PAYMENT_MODE.Cash ||
    mode === PAYMENT_MODE.Upi ||
    mode === PAYMENT_MODE.Finance ||
    mode === PAYMENT_MODE.Mixed
  ) {
    return mode;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "cash") {
      return PAYMENT_MODE.Cash;
    }
    if (normalized === "upi") {
      return PAYMENT_MODE.Upi;
    }
    if (normalized === "finance") {
      return PAYMENT_MODE.Finance;
    }
    if (normalized === "mixed") {
      return PAYMENT_MODE.Mixed;
    }
  }

  return PAYMENT_MODE.Cash;
}

export function getVehicleStatusLabel(status: VehicleStatus | number): string {
  return Number(status) === VEHICLE_STATUS.Sold ? "Sold" : "Available";
}

export function parseVehicleStatus(value: unknown): VehicleStatus {
  const status = Number(value);
  if (status === VEHICLE_STATUS.Sold) {
    return VEHICLE_STATUS.Sold;
  }
  return VEHICLE_STATUS.Available;
}
