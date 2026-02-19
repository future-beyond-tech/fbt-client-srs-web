"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { PAYMENT_MODE, getPaymentModeLabel } from "@/types/enums";
import type { SaleDetails } from "@/types/sale";

type BillLayoutProps = {
  sale: SaleDetails;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BillLayout({ sale }: BillLayoutProps) {
  const [isImageError, setIsImageError] = useState(false);

  const paymentAmount = useMemo(() => {
    if (sale.totalReceived > 0) {
      return sale.totalReceived;
    }

    if (sale.paymentMode === PAYMENT_MODE.Cash) {
      return sale.cashAmount;
    }

    if (sale.paymentMode === PAYMENT_MODE.Upi) {
      return sale.upiAmount;
    }

    if (sale.paymentMode === PAYMENT_MODE.Finance) {
      return sale.financeAmount;
    }

    return sale.cashAmount + sale.upiAmount + sale.financeAmount;
  }, [sale]);

  const grandTotal = paymentAmount > 0 ? paymentAmount : sale.vehicle.sellingPrice;
  const imageSource = sale.customer.photoUrl.trim();
  const vehicleLine =
    sale.vehicle.brand || sale.vehicle.model
      ? `${sale.vehicle.brand} ${sale.vehicle.model}`.trim()
      : sale.vehicleLabel || "-";

  return (
    <article className="bill-sheet space-y-8 overflow-hidden rounded-xl bg-white p-6 shadow-sm md:p-10">
      <section className="bill-section flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SRS Dealership</h1>
          <p className="mt-2 text-sm text-gray-600">16/4, Main Road, Salem, Tamil Nadu</p>
          <p className="text-sm text-gray-600">+91 98765 43210</p>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-left md:text-right">
          <div>
            <dt className="text-sm text-gray-500">Bill Number</dt>
            <dd className="text-base font-semibold text-gray-900">{sale.billNumber || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Sale Date</dt>
            <dd className="text-base text-gray-900">{formatDate(sale.saleDate)}</dd>
          </div>
        </dl>
      </section>

      <section className="bill-section space-y-4 border-b border-gray-200 pb-6">
        <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start">
          <dl className="min-w-0 space-y-4">
            <DetailItem label="Name" value={sale.customer.name || sale.customerName || "-"} />
            <DetailItem label="Phone" value={sale.customer.phone || "-"} />
            <DetailItem label="Address" value={sale.customer.address || "-"} />
          </dl>

          <div className="justify-self-start md:justify-self-end">
            {imageSource && !isImageError ? (
              <Image
                src={imageSource}
                alt={`${sale.customer.name || "Customer"} photo`}
                width={160}
                height={200}
                loading="lazy"
                sizes="128px"
                unoptimized
                onError={() => setIsImageError(true)}
                className="h-40 w-32 rounded-md border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-40 w-32 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs font-medium text-gray-500">
                No Photo
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bill-section space-y-4 border-b border-gray-200 pb-6">
        <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Vehicle" value={vehicleLine} />
          <DetailItem label="Year" value={sale.vehicle.year ? String(sale.vehicle.year) : "-"} />
          <DetailItem
            label="Registration Number"
            value={sale.vehicle.registrationNumber || "-"}
          />
          <DetailItem label="Chassis Number" value={sale.vehicle.chassisNumber || "-"} />
          <DetailItem label="Engine Number" value={sale.vehicle.engineNumber || "-"} />
          <DetailItem
            label="Selling Price"
            value={formatCurrency(sale.vehicle.sellingPrice || sale.totalReceived)}
          />
        </div>
      </section>

      <section className="bill-section space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Payment Mode" value={getPaymentModeLabel(sale.paymentMode)} />

          {(sale.paymentMode === PAYMENT_MODE.Cash || sale.paymentMode === PAYMENT_MODE.Mixed) &&
          sale.cashAmount > 0 ? (
            <DetailItem label="Cash Amount" value={formatCurrency(sale.cashAmount)} />
          ) : null}

          {(sale.paymentMode === PAYMENT_MODE.Upi || sale.paymentMode === PAYMENT_MODE.Mixed) &&
          sale.upiAmount > 0 ? (
            <DetailItem label="UPI Amount" value={formatCurrency(sale.upiAmount)} />
          ) : null}

          {(sale.paymentMode === PAYMENT_MODE.Finance ||
            sale.paymentMode === PAYMENT_MODE.Mixed) &&
          sale.financeAmount > 0 ? (
            <>
              <DetailItem
                label="Finance Amount"
                value={formatCurrency(sale.financeAmount)}
              />
              <DetailItem label="Finance Company" value={sale.financeCompany || "-"} />
            </>
          ) : null}
        </div>

        <div className="bill-total rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Grand Total</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </section>
    </article>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words text-base text-gray-900">{value}</p>
    </div>
  );
}
