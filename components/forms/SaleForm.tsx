"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import VehicleDropdown from "@/components/ui/VehicleDropdown";
import PaymentSection from "@/components/ui/PaymentSection";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { PAYMENT_MODE, type PaymentMode } from "@/types/enums";
import { createSale } from "@/services/sales.service";
import { getAvailableVehicles } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

type CustomerValues = {
  name: string;
  phone: string;
  address: string;
  photoUrl: string;
};

type PaymentValues = {
  mode: PaymentMode;
  cashAmount: string;
  upiAmount: string;
  financeAmount: string;
  financeCompany: string;
};

type SaleFormErrors = {
  vehicleId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  photoUrl?: string;
  cashAmount?: string;
  upiAmount?: string;
  financeAmount?: string;
  financeCompany?: string;
  paymentTotal?: string;
};

type CustomerErrorField = "Name" | "Phone" | "Address";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

function parsePositiveNumber(value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

function scrollToError(
  errors: SaleFormErrors,
  refs: MutableRefObject<Record<string, HTMLDivElement | null>>,
) {
  const order: Array<keyof SaleFormErrors> = [
    "vehicleId",
    "customerName",
    "customerPhone",
    "customerAddress",
    "photoUrl",
    "cashAmount",
    "upiAmount",
    "financeAmount",
    "financeCompany",
    "paymentTotal",
  ];

  const firstErrorKey = order.find((key) => Boolean(errors[key]));
  if (!firstErrorKey) {
    return;
  }

  const node = refs.current[firstErrorKey];
  if (node) {
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

export default function SaleForm() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [customer, setCustomer] = useState<CustomerValues>({
    name: "",
    phone: "",
    address: "",
    photoUrl: "",
  });
  const [payment, setPayment] = useState<PaymentValues>({
    mode: PAYMENT_MODE.Cash,
    cashAmount: "",
    upiAmount: "",
    financeAmount: "",
    financeCompany: "",
  });

  const [errors, setErrors] = useState<SaleFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const customerNameInputRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  const paymentTotal = useMemo(() => {
    if (payment.mode === PAYMENT_MODE.Cash) {
      return parsePositiveNumber(payment.cashAmount);
    }

    if (payment.mode === PAYMENT_MODE.Upi) {
      return parsePositiveNumber(payment.upiAmount);
    }

    if (payment.mode === PAYMENT_MODE.Finance) {
      return parsePositiveNumber(payment.financeAmount);
    }

    return (
      parsePositiveNumber(payment.cashAmount) +
      parsePositiveNumber(payment.upiAmount) +
      parsePositiveNumber(payment.financeAmount)
    );
  }, [payment]);

  const fetchAvailableVehicles = useCallback(async (signal?: AbortSignal) => {
    setIsVehiclesLoading(true);
    setVehiclesError("");

    try {
      const list = await getAvailableVehicles(signal);
      setVehicles(list);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load available vehicles.";
      setVehiclesError(message);
    } finally {
      if (!signal?.aborted) {
        setIsVehiclesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAvailableVehicles(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAvailableVehicles]);

  useEffect(() => {
    if (selectedVehicleId) {
      customerNameInputRef.current?.focus();
    }
  }, [selectedVehicleId]);

  const setFieldRef =
    (key: string) =>
    (node: HTMLDivElement | null): void => {
      fieldRefs.current[key] = node;
    };

  const setCustomerField = (field: keyof CustomerValues, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));

    if (field === "photoUrl") {
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));
      return;
    }

    const mappedField = `customer${
      field[0].toUpperCase() + field.slice(1)
    }` as `customer${CustomerErrorField}`;
    setErrors((prev) => ({ ...prev, [mappedField]: undefined }));
  };

  const setPaymentField = (field: keyof PaymentValues, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, paymentTotal: undefined }));
  };

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setErrors((prev) => ({ ...prev, vehicleId: undefined }));
  };

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPayment((prev) => ({
      ...prev,
      mode,
      cashAmount:
        mode === PAYMENT_MODE.Cash || mode === PAYMENT_MODE.Mixed ? prev.cashAmount : "",
      upiAmount:
        mode === PAYMENT_MODE.Upi || mode === PAYMENT_MODE.Mixed ? prev.upiAmount : "",
      financeAmount:
        mode === PAYMENT_MODE.Finance || mode === PAYMENT_MODE.Mixed
          ? prev.financeAmount
          : "",
      financeCompany:
        mode === PAYMENT_MODE.Finance || mode === PAYMENT_MODE.Mixed
          ? prev.financeCompany
          : "",
    }));
    setErrors((prev) => ({
      ...prev,
      cashAmount: undefined,
      upiAmount: undefined,
      financeAmount: undefined,
      financeCompany: undefined,
      paymentTotal: undefined,
    }));
  };

  const validateForm = (): SaleFormErrors => {
    const nextErrors: SaleFormErrors = {};
    const sellingPrice = selectedVehicle?.sellingPrice ?? 0;
    const phoneDigits = customer.phone.trim().replace(/\D/g, "");
    const cashAmount = parsePositiveNumber(payment.cashAmount);
    const upiAmount = parsePositiveNumber(payment.upiAmount);
    const financeAmount = parsePositiveNumber(payment.financeAmount);

    if (!selectedVehicleId) {
      nextErrors.vehicleId = "Please select a vehicle.";
    }

    if (!customer.name.trim()) {
      nextErrors.customerName = "Customer name is required.";
    }

    if (!phoneDigits || !/^\d{10}$/.test(phoneDigits)) {
      nextErrors.customerPhone = "Phone number must be 10 digits.";
    }

    if (!customer.address.trim()) {
      nextErrors.customerAddress = "Customer address is required.";
    }

    if (!customer.photoUrl) {
      nextErrors.photoUrl = "Customer photo is required.";
    }

    if (payment.mode === PAYMENT_MODE.Cash && cashAmount <= 0) {
      nextErrors.cashAmount = "Cash amount must be a positive number.";
    }

    if (payment.mode === PAYMENT_MODE.Upi && upiAmount <= 0) {
      nextErrors.upiAmount = "UPI amount must be a positive number.";
    }

    if (payment.mode === PAYMENT_MODE.Finance) {
      if (financeAmount <= 0) {
        nextErrors.financeAmount = "Finance amount must be a positive number.";
      }
      if (!payment.financeCompany.trim()) {
        nextErrors.financeCompany = "Finance company is required.";
      }
    }

    if (payment.mode === PAYMENT_MODE.Mixed) {
      if (cashAmount <= 0 && upiAmount <= 0 && financeAmount <= 0) {
        nextErrors.paymentTotal = "Enter at least one payment amount.";
      }

      if (financeAmount > 0 && !payment.financeCompany.trim()) {
        nextErrors.financeCompany = "Finance company is required when finance is used.";
      }
    }

    if (sellingPrice > 0 && paymentTotal !== sellingPrice) {
      nextErrors.paymentTotal = "Total payment must match selling price";
    }

    return nextErrors;
  };

  const isSubmitDisabled =
    isSubmitting ||
    isUploadingPhoto ||
    isVehiclesLoading ||
    !selectedVehicle ||
    !customer.photoUrl ||
    paymentTotal <= 0 ||
    (selectedVehicle ? paymentTotal !== selectedVehicle.sellingPrice : true);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToError(validationErrors, fieldRefs);
      return;
    }

    if (!selectedVehicle) {
      return;
    }

    const phoneDigits = customer.phone.trim().replace(/\D/g, "");
    const cashAmount = parsePositiveNumber(payment.cashAmount);
    const upiAmount = parsePositiveNumber(payment.upiAmount);
    const financeAmount = parsePositiveNumber(payment.financeAmount);

    setIsSubmitting(true);

    try {
      const response = await createSale({
        vehicleId: selectedVehicle.id,
        customerName: customer.name.trim(),
        customerPhone: phoneDigits,
        customerAddress: customer.address.trim(),
        customerPhotoUrl: customer.photoUrl,
        paymentMode: payment.mode,
        cashAmount: cashAmount || undefined,
        upiAmount: upiAmount || undefined,
        financeAmount: financeAmount || undefined,
        financeCompany: payment.financeCompany.trim() || undefined,
        saleDate: new Date().toISOString(),
      });

      router.push(`/sales/${encodeURIComponent(response.billNumber)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create sale. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-2 md:space-y-6">
      <section
        className="scroll-mt-24 rounded-xl bg-white p-4 shadow-sm sm:p-5 md:p-6"
        ref={setFieldRef("vehicleId")}
      >
        <h2 className="text-lg font-semibold text-gray-900">Step 1: Vehicle Selection</h2>
        <p className="mt-1 text-sm text-gray-600">Choose an available vehicle for billing.</p>

        <div className="mt-4">
          <VehicleDropdown
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelect={handleVehicleSelect}
            error={errors.vehicleId}
            loading={isVehiclesLoading}
          />
          {vehiclesError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{vehiclesError}</p>
              <button
                type="button"
                onClick={() => void fetchAvailableVehicles()}
                className="mt-2 inline-flex min-h-[44px] items-center rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="scroll-mt-24 rounded-xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 2: Customer Info</h2>
        <p className="mt-1 text-sm text-gray-600">Capture buyer details and photo.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2" ref={setFieldRef("customerName")}>
            <label htmlFor="customerName" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="customerName"
              ref={customerNameInputRef}
              type="text"
              value={customer.name}
              onChange={(event) => setCustomerField("name", event.target.value)}
              className={`min-h-[44px] w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.customerName
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? "customerName-error" : undefined}
            />
            {errors.customerName ? (
              <p id="customerName-error" className="text-xs font-medium text-red-600">
                {errors.customerName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2" ref={setFieldRef("customerPhone")}>
            <label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={customer.phone}
              onChange={(event) => setCustomerField("phone", event.target.value)}
              className={`min-h-[44px] w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.customerPhone
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
            />
            {errors.customerPhone ? (
              <p id="customerPhone-error" className="text-xs font-medium text-red-600">
                {errors.customerPhone}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2" ref={setFieldRef("customerAddress")}>
            <label htmlFor="customerAddress" className="text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="customerAddress"
              rows={3}
              value={customer.address}
              onChange={(event) => setCustomerField("address", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.customerAddress
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
              aria-invalid={Boolean(errors.customerAddress)}
              aria-describedby={errors.customerAddress ? "customerAddress-error" : undefined}
            />
            {errors.customerAddress ? (
              <p id="customerAddress-error" className="text-xs font-medium text-red-600">
                {errors.customerAddress}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2" ref={setFieldRef("photoUrl")}>
            <label className="text-sm font-medium text-gray-700">Photo Upload</label>
            <PhotoUpload
              value={customer.photoUrl}
              error={errors.photoUrl}
              onChange={(photoUrl) => {
                setCustomerField("photoUrl", photoUrl);
              }}
              onUploadingChange={setIsUploadingPhoto}
            />
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 rounded-xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 3: Payment</h2>
        <p className="mt-1 text-sm text-gray-600">Choose payment mode and capture transaction.</p>

        <div className="mt-4">
          <div
            ref={(node) => {
              fieldRefs.current.cashAmount = node;
              fieldRefs.current.upiAmount = node;
              fieldRefs.current.financeAmount = node;
              fieldRefs.current.financeCompany = node;
              fieldRefs.current.paymentTotal = node;
            }}
          >
            <PaymentSection
              values={payment}
              errors={errors}
              onModeChange={handlePaymentModeChange}
              onFieldChange={setPaymentField}
              sellingPrice={selectedVehicle?.sellingPrice ?? 0}
            />
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 rounded-xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 4: Submit Sale</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">Selected Vehicle Price</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(selectedVehicle?.sellingPrice ?? 0)}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-gray-600">Entered Total</p>
            <p className="font-semibold text-gray-900">{formatCurrency(paymentTotal)}</p>
          </div>
        </div>

        {submitError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Creating Bill...
              </span>
            ) : (
              "Generate Bill"
            )}
          </button>
        </div>
      </section>
    </form>
  );
}
