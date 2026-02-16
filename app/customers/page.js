"use client";

import { useState } from "react";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import SectionHeader from "@/components/ui/SectionHeader";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { useBilling } from "@/features/billing/BillingContext";

const defaultCustomerForm = {
  name: "",
  phone: "",
  address: "",
};

export default function CustomersPage() {
  const { customers, addCustomer } = useBilling();
  const [formData, setFormData] = useState(defaultCustomerForm);
  const [notice, setNotice] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addCustomer(formData);
    setFormData(defaultCustomerForm);
    setNotice("Customer added to local records.");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Customers"
        description="Store buyer details locally for quick invoice generation."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel xl:col-span-1">
          <h3 className="text-base font-semibold text-slate-900">Add Customer</h3>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="name"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer name"
              required
            />

            <FormInput
              id="phone"
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9XXXXXXXXX"
              required
            />

            <FormTextarea
              id="address"
              label="Address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Customer address"
              required
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add Customer
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
            title="Customer List"
            description="Mobile-friendly table cards with all customer details."
          />

          <ResponsiveTable
            columns={columns}
            data={customers}
            mobileTitleKey="name"
            emptyTitle="No customers yet"
            emptyMessage="Add customer information using the form."
          />
        </section>
      </div>
    </div>
  );
}
