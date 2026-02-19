"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/services/purchase.service";
import type { CreatePurchaseInput } from "@/types/purchase";

type PurchaseFormValues = {
  brand: string;
  model: string;
  year: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  sellingPrice: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  buyingCost: string;
  expense: string;
  purchaseDate: string;
};

type PurchaseFormErrors = Partial<Record<keyof PurchaseFormValues, string>>;

const defaultValues: PurchaseFormValues = {
  brand: "",
  model: "",
  year: "",
  registrationNumber: "",
  chassisNumber: "",
  engineNumber: "",
  sellingPrice: "",
  sellerName: "",
  sellerPhone: "",
  sellerAddress: "",
  buyingCost: "",
  expense: "",
  purchaseDate: "",
};

function sanitizeValues(values: PurchaseFormValues): PurchaseFormValues {
  return {
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: values.year.trim(),
    registrationNumber: values.registrationNumber.trim(),
    chassisNumber: values.chassisNumber.trim(),
    engineNumber: values.engineNumber.trim(),
    sellingPrice: values.sellingPrice.trim(),
    sellerName: values.sellerName.trim(),
    sellerPhone: values.sellerPhone.trim(),
    sellerAddress: values.sellerAddress.trim(),
    buyingCost: values.buyingCost.trim(),
    expense: values.expense.trim(),
    purchaseDate: values.purchaseDate.trim(),
  };
}

function isValidYear(year: string): boolean {
  if (!/^\d{4}$/.test(year)) {
    return false;
  }

  const parsed = Number(year);
  const currentYear = new Date().getFullYear();
  return parsed >= 1900 && parsed <= currentYear + 1;
}

function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/\D/g, ""));
}

function validate(values: PurchaseFormValues): PurchaseFormErrors {
  const errors: PurchaseFormErrors = {};

  if (!values.brand) {
    errors.brand = "Brand is required.";
  }
  if (!values.model) {
    errors.model = "Model is required.";
  }
  if (!isValidYear(values.year)) {
    errors.year = "Year must be a valid 4-digit number.";
  }
  if (!values.registrationNumber) {
    errors.registrationNumber = "Registration number is required.";
  }
  if (!values.sellerName) {
    errors.sellerName = "Seller name is required.";
  }
  if (!isValidPhone(values.sellerPhone)) {
    errors.sellerPhone = "Seller phone must be 10 digits.";
  }

  const sellingPrice = Number(values.sellingPrice);
  if (!values.sellingPrice || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
    errors.sellingPrice = "Selling price must be greater than 0.";
  }

  const buyingCost = Number(values.buyingCost);
  if (!values.buyingCost || Number.isNaN(buyingCost) || buyingCost <= 0) {
    errors.buyingCost = "Buying cost must be greater than 0.";
  }

  const expense = Number(values.expense);
  if (!values.expense || Number.isNaN(expense) || expense < 0) {
    errors.expense = "Expense must be 0 or greater.";
  }

  if (!values.purchaseDate) {
    errors.purchaseDate = "Purchase date is required.";
  }

  return errors;
}

export default function PurchaseForm() {
  const router = useRouter();
  const [values, setValues] = useState<PurchaseFormValues>(defaultValues);
  const [errors, setErrors] = useState<PurchaseFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const setFieldValue = (field: keyof PurchaseFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedValues = sanitizeValues(values);
    const validationErrors = validate(sanitizedValues);

    setValues(sanitizedValues);
    setErrors(validationErrors);
    setSubmitError("");
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: CreatePurchaseInput = {
      brand: sanitizedValues.brand,
      model: sanitizedValues.model,
      year: Number(sanitizedValues.year),
      registrationNumber: sanitizedValues.registrationNumber,
      chassisNumber: sanitizedValues.chassisNumber || undefined,
      engineNumber: sanitizedValues.engineNumber || undefined,
      sellingPrice: Number(sanitizedValues.sellingPrice),
      sellerName: sanitizedValues.sellerName,
      sellerPhone: sanitizedValues.sellerPhone.replace(/\D/g, ""),
      sellerAddress: sanitizedValues.sellerAddress || undefined,
      buyingCost: Number(sanitizedValues.buyingCost),
      expense: Number(sanitizedValues.expense),
      purchaseDate: sanitizedValues.purchaseDate,
    };

    setIsSubmitting(true);

    try {
      await createPurchase(payload);
      setSuccessMessage("Purchase added successfully. Redirecting to vehicles...");
      router.push("/vehicles");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create purchase. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              id="brand"
              label="Brand"
              value={values.brand}
              onChange={(value) => setFieldValue("brand", value)}
              error={errors.brand}
              placeholder="e.g. Hyundai"
            />
            <Field
              id="model"
              label="Model"
              value={values.model}
              onChange={(value) => setFieldValue("model", value)}
              error={errors.model}
              placeholder="e.g. i20"
            />
            <Field
              id="year"
              label="Year"
              type="number"
              value={values.year}
              onChange={(value) => setFieldValue("year", value)}
              error={errors.year}
              placeholder="e.g. 2024"
            />
            <Field
              id="registrationNumber"
              label="Registration Number"
              value={values.registrationNumber}
              onChange={(value) => setFieldValue("registrationNumber", value)}
              error={errors.registrationNumber}
              placeholder="e.g. TN10AB1234"
            />
            <Field
              id="chassisNumber"
              label="Chassis Number"
              value={values.chassisNumber}
              onChange={(value) => setFieldValue("chassisNumber", value)}
              error={errors.chassisNumber}
              placeholder="Optional"
            />
            <Field
              id="engineNumber"
              label="Engine Number"
              value={values.engineNumber}
              onChange={(value) => setFieldValue("engineNumber", value)}
              error={errors.engineNumber}
              placeholder="Optional"
            />
            <Field
              id="buyingCost"
              label="Buying Cost"
              type="number"
              value={values.buyingCost}
              onChange={(value) => setFieldValue("buyingCost", value)}
              error={errors.buyingCost}
            />
            <Field
              id="expense"
              label="Expense"
              type="number"
              value={values.expense}
              onChange={(value) => setFieldValue("expense", value)}
              error={errors.expense}
            />
            <Field
              id="sellingPrice"
              label="Selling Price"
              type="number"
              value={values.sellingPrice}
              onChange={(value) => setFieldValue("sellingPrice", value)}
              error={errors.sellingPrice}
            />
            <Field
              id="purchaseDate"
              label="Purchase Date"
              type="date"
              value={values.purchaseDate}
              onChange={(value) => setFieldValue("purchaseDate", value)}
              error={errors.purchaseDate}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Seller Details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              id="sellerName"
              label="Seller Name"
              value={values.sellerName}
              onChange={(value) => setFieldValue("sellerName", value)}
              error={errors.sellerName}
            />
            <Field
              id="sellerPhone"
              label="Seller Phone"
              type="tel"
              value={values.sellerPhone}
              onChange={(value) => setFieldValue("sellerPhone", value)}
              error={errors.sellerPhone}
            />
            <Field
              id="sellerAddress"
              label="Seller Address"
              value={values.sellerAddress}
              onChange={(value) => setFieldValue("sellerAddress", value)}
              error={errors.sellerAddress}
              className="md:col-span-2"
            />
          </div>
        </div>

        {hasErrors ? (
          <p className="text-sm text-red-600">Please correct the highlighted fields.</p>
        ) : null}

        {submitError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Saving...
              </span>
            ) : (
              "Save Purchase"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "number" | "date" | "tel";
  placeholder?: string;
  className?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className,
}: FieldProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`min-h-[44px] w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
