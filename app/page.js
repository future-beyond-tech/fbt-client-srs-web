"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { useBilling } from "@/features/billing/BillingContext";
import { formatCurrency, formatDate } from "@/features/utils/formatters";

export default function DashboardPage() {
  const { dashboardStats, invoices } = useBilling();

  const cards = [
    {
      title: "Total Vehicles",
      value: dashboardStats.totalVehicles,
      subtitle: "All listed vehicles",
    },
    {
      title: "Vehicles Sold",
      value: dashboardStats.soldVehicles,
      subtitle: "Inventory moved",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      subtitle: "Combined invoice value",
    },
    {
      title: "Today’s Revenue",
      value: formatCurrency(dashboardStats.todaysRevenue),
      subtitle: "Invoices dated today",
    },
  ];

  const invoiceColumns = [
    {
      key: "invoiceNumber",
      label: "Invoice Number",
    },
    {
      key: "invoiceDate",
      label: "Date",
      render: (row) => formatDate(row.invoiceDate),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.customer.name,
    },
    {
      key: "paymentMode",
      label: "Payment",
    },
    {
      key: "finalTotal",
      label: "Total",
      render: (row) => formatCurrency(row.finalTotal),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        description="Live summary from static sample records and generated invoices."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
          />
        ))}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Recent Invoices"
          description="Latest billing activity in the demo workflow"
        />

        <ResponsiveTable
          columns={invoiceColumns}
          data={invoices.slice(0, 6)}
          mobileTitleKey="invoiceNumber"
          emptyTitle="No invoices yet"
          emptyMessage="Create a bill from the Billing page to see invoice data."
        />
      </section>
    </div>
  );
}
