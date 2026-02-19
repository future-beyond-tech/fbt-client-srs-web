"use client";

import { PAYMENT_MODE, getPaymentModeLabel, type PaymentMode } from "@/types/enums";

type PaymentValues = {
  mode: PaymentMode;
  cashAmount: string;
  upiAmount: string;
  financeAmount: string;
  financeCompany: string;
};

type PaymentErrors = {
  cashAmount?: string;
  upiAmount?: string;
  financeAmount?: string;
  financeCompany?: string;
  paymentTotal?: string;
};

type PaymentSectionProps = {
  values: PaymentValues;
  errors: PaymentErrors;
  onModeChange: (mode: PaymentMode) => void;
  onFieldChange: (field: keyof PaymentValues, value: string) => void;
  sellingPrice: number;
};

const paymentModeOptions: PaymentMode[] = [
  PAYMENT_MODE.Cash,
  PAYMENT_MODE.Upi,
  PAYMENT_MODE.Finance,
  PAYMENT_MODE.Mixed,
];

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

function getPaymentTotal(values: PaymentValues): number {
  if (values.mode === PAYMENT_MODE.Cash) {
    return parsePositiveNumber(values.cashAmount);
  }

  if (values.mode === PAYMENT_MODE.Upi) {
    return parsePositiveNumber(values.upiAmount);
  }

  if (values.mode === PAYMENT_MODE.Finance) {
    return parsePositiveNumber(values.financeAmount);
  }

  return (
    parsePositiveNumber(values.cashAmount) +
    parsePositiveNumber(values.upiAmount) +
    parsePositiveNumber(values.financeAmount)
  );
}

export default function PaymentSection({
  values,
  errors,
  onModeChange,
  onFieldChange,
  sellingPrice,
}: PaymentSectionProps) {
  const totalPaid = getPaymentTotal(values);
  const showCashAmount = values.mode === PAYMENT_MODE.Cash || values.mode === PAYMENT_MODE.Mixed;
  const showUpiAmount = values.mode === PAYMENT_MODE.Upi || values.mode === PAYMENT_MODE.Mixed;
  const showFinanceFields =
    values.mode === PAYMENT_MODE.Finance || values.mode === PAYMENT_MODE.Mixed;

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Payment Mode</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {paymentModeOptions.map((mode) => (
            <label
              key={mode}
              className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                values.mode === mode
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="paymentMode"
                value={mode}
                checked={values.mode === mode}
                onChange={() => onModeChange(mode)}
                className="h-4 w-4 accent-blue-600"
              />
              <span className="font-medium">{getPaymentModeLabel(mode)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {(showCashAmount || showUpiAmount || showFinanceFields) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {showCashAmount ? (
            <Field
              id="cashAmount"
              label="Cash Amount"
              value={values.cashAmount}
              error={errors.cashAmount}
              onChange={(value) => onFieldChange("cashAmount", value)}
            />
          ) : null}

          {showUpiAmount ? (
            <Field
              id="upiAmount"
              label="UPI Amount"
              value={values.upiAmount}
              error={errors.upiAmount}
              onChange={(value) => onFieldChange("upiAmount", value)}
            />
          ) : null}

          {showFinanceFields ? (
            <Field
              id="financeAmount"
              label="Finance Amount"
              value={values.financeAmount}
              error={errors.financeAmount}
              onChange={(value) => onFieldChange("financeAmount", value)}
            />
          ) : null}

          {showFinanceFields ? (
            <TextField
              id="financeCompany"
              label="Finance Company"
              value={values.financeCompany}
              error={errors.financeCompany}
              onChange={(value) => onFieldChange("financeCompany", value)}
              placeholder="e.g. Tata Capital"
            />
          ) : null}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Selling Price</span>
          <span className="font-semibold text-gray-900">{formatCurrency(sellingPrice)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-gray-600">Total Paid</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalPaid)}</span>
        </div>
        {errors.paymentTotal ? (
          <p className="mt-3 text-xs font-medium text-red-600">{errors.paymentTotal}</p>
        ) : null}
      </div>
    </div>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function Field({ id, label, value, error, onChange }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextField({ id, label, value, error, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
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
