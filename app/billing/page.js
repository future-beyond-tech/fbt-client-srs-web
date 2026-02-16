"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useBilling } from "@/features/billing/BillingContext";
import { formatCurrency } from "@/features/utils/formatters";

export default function BillingPage() {
  const router = useRouter();
  const { customers, availableVehicles, createInvoice } = useBilling();

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [gstEnabled, setGstEnabled] = useState(true);

  const activeCustomerId = customers.some((item) => item.id === customerId)
    ? customerId
    : customers[0]?.id ?? "";

  const activeVehicleId = availableVehicles.some((item) => item.id === vehicleId)
    ? vehicleId
    : availableVehicles[0]?.id ?? "";

  const selectedVehicle = useMemo(
    () => availableVehicles.find((item) => item.id === activeVehicleId) ?? null,
    [availableVehicles, activeVehicleId],
  );

  const subtotal = selectedVehicle ? Number(selectedVehicle.sellingPrice) : 0;
  const gstAmount = gstEnabled ? subtotal * 0.18 : 0;
  const finalTotal = subtotal + gstAmount;

  const handleSubmit = (event) => {
    event.preventDefault();

    const invoice = createInvoice({
      customerId: activeCustomerId,
      vehicleId: activeVehicleId,
      gstEnabled,
      paymentMode,
    });

    if (invoice) {
      router.push("/invoice");
    }
  };

  const customerOptions = customers.length
    ? customers.map((customer) => ({
        value: customer.id,
        label: `${customer.name} (${customer.phone})`,
      }))
    : [{ value: "", label: "No customers available" }];

  const vehicleOptions = availableVehicles.length
    ? availableVehicles.map((vehicle) => ({
        value: vehicle.id,
        label: `${vehicle.type} | ${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`,
      }))
    : [{ value: "", label: "No available vehicles" }];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Billing"
        description="Create a bill with GST logic and auto-calculated totals."
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel xl:col-span-3">
          {!customers.length || !availableVehicles.length ? (
            <EmptyState
              title="Billing cannot be created right now"
              message="Make sure at least one customer exists and one vehicle is available."
            />
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormSelect
                id="customerId"
                label="Select Customer"
                value={activeCustomerId}
                onChange={(event) => setCustomerId(event.target.value)}
                options={customerOptions}
                required
              />

              <FormSelect
                id="vehicleId"
                label="Select Vehicle"
                value={activeVehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                options={vehicleOptions}
                required
              />

              <FormInput
                id="sellingPrice"
                label="Selling Price"
                value={formatCurrency(subtotal)}
                readOnly
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Apply GST</span>
                    <span className="block text-xs text-slate-500">18% GST on selling price</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(event) => setGstEnabled(event.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                </label>
              </div>

              <FormSelect
                id="paymentMode"
                label="Payment Mode"
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value)}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Bank", label: "Bank" },
                  { value: "UPI", label: "UPI" },
                ]}
                required
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Generate Invoice Preview
              </button>
            </form>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Bill Summary</h3>
          <p className="mt-1 text-sm text-slate-500">
            Totals are recalculated instantly when you change vehicle or GST.
          </p>

          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(subtotal)}</dd>
            </div>

            <div className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">GST (18%)</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(gstAmount)}</dd>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-semibold text-slate-800">Final Total</dt>
                <dd className="text-lg font-bold text-blue-700">
                  {formatCurrency(finalTotal)}
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-6 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            Vehicle status will change to Sold after invoice generation.
          </p>
        </aside>
      </div>
    </div>
  );
}
