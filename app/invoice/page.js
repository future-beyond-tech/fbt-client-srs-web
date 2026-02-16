"use client";

import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useBilling } from "@/features/billing/BillingContext";
import { formatCurrency, formatDate } from "@/features/utils/formatters";

export default function InvoicePage() {
  const { latestInvoice } = useBilling();

  if (!latestInvoice) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Invoice Preview"
          description="Generate a bill first to see a printable invoice."
        />
        <EmptyState
          title="No invoice available"
          message="Create a bill from the Billing page to preview and print the invoice."
        />
        <Link
          href="/billing"
          className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Billing
        </Link>
      </div>
    );
  }

  const gstPercent = Math.round(latestInvoice.gstRate * 100);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Invoice Preview"
        description="Clean printable invoice for customer billing handoff."
        action={
          <div className="no-print flex gap-2">
            <Link
              href="/billing"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to Billing
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Print Invoice
            </button>
          </div>
        }
      />

      <article className="invoice-shell rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-8">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Tax Invoice
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Shree Ramalingam Sons
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Bike & Car Buying and Selling Business
            </p>
          </div>

          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-600">Invoice #:</dt>
              <dd className="text-slate-900">{latestInvoice.invoiceNumber}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-600">Date:</dt>
              <dd className="text-slate-900">{formatDate(latestInvoice.invoiceDate)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-600">Payment:</dt>
              <dd className="text-slate-900">{latestInvoice.paymentMode}</dd>
            </div>
          </dl>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Billed To</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {latestInvoice.customer.name}
            </p>
            <p className="mt-1 text-sm text-slate-600">{latestInvoice.customer.phone}</p>
            <p className="mt-1 text-sm text-slate-600">{latestInvoice.customer.address}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vehicle Details
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {latestInvoice.vehicle.brand} {latestInvoice.vehicle.model}
            </p>
            <p className="mt-1 text-sm text-slate-600">Type: {latestInvoice.vehicle.type}</p>
            <p className="mt-1 text-sm text-slate-600">
              Reg No: {latestInvoice.vehicle.registrationNumber}
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-600">Vehicle Selling Price</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(latestInvoice.subtotal)}
                </td>
              </tr>

              <tr className="border-b border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-600">
                  GST ({gstPercent > 0 ? `${gstPercent}%` : "Not Applied"})
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(latestInvoice.gstAmount)}
                </td>
              </tr>

              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-base font-semibold text-blue-900">Final Total</td>
                <td className="px-4 py-3 text-right text-base font-bold text-blue-900">
                  {formatCurrency(latestInvoice.finalTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t border-dashed border-slate-300 pt-5 text-xs text-slate-500">
          This invoice is generated for demo purposes using static sample data.
        </footer>
      </article>
    </div>
  );
}
