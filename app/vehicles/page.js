"use client";

import { useState } from "react";
import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { useBilling } from "@/features/billing/BillingContext";
import { formatCurrency } from "@/features/utils/formatters";

const defaultVehicleForm = {
  type: "Car",
  brand: "",
  model: "",
  registrationNumber: "",
  purchasePrice: "",
  sellingPrice: "",
  status: "Available",
};

export default function VehiclesPage() {
  const { vehicles, addVehicle } = useBilling();
  const [formData, setFormData] = useState(defaultVehicleForm);
  const [notice, setNotice] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addVehicle(formData);
    setFormData(defaultVehicleForm);
    setNotice("Vehicle added to local inventory list.");
  };

  const columns = [
    { key: "type", label: "Type" },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "registrationNumber", label: "Registration Number" },
    {
      key: "purchasePrice",
      label: "Purchase Price",
      render: (row) => formatCurrency(row.purchasePrice),
    },
    {
      key: "sellingPrice",
      label: "Selling Price",
      render: (row) => formatCurrency(row.sellingPrice),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vehicles"
        description="Manage bike and car inventory using static local form handling."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel xl:col-span-1">
          <h3 className="text-base font-semibold text-slate-900">Add Vehicle</h3>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <FormSelect
              id="type"
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              options={[
                { value: "Car", label: "Car" },
                { value: "Bike", label: "Bike" },
              ]}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormInput
                id="brand"
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Hyundai"
                required
              />

              <FormInput
                id="model"
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. i20 Sportz"
                required
              />

              <FormInput
                id="registrationNumber"
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. TN10AB4567"
                required
              />

              <FormInput
                id="purchasePrice"
                type="number"
                min="0"
                label="Purchase Price"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
              />

              <FormInput
                id="sellingPrice"
                type="number"
                min="0"
                label="Selling Price"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add Vehicle
            </button>
          </form>

          {notice ? (
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              {notice}
            </p>
          ) : null}
        </section>

        <section className="space-y-4 xl:col-span-2">
          <SectionHeader
            title="Inventory List"
            description="Desktop table and mobile stacked cards for easy viewing on small screens."
          />

          <ResponsiveTable
            columns={columns}
            data={vehicles}
            mobileTitleKey="registrationNumber"
            emptyTitle="No vehicles available"
            emptyMessage="Add your first vehicle using the form."
          />
        </section>
      </div>
    </div>
  );
}
