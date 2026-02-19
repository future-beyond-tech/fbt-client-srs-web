"use client";

import { memo, useMemo } from "react";
import type { DashboardSummary } from "@/services/dashboard.service";

type DashboardCardsProps = {
  summary: DashboardSummary;
};

const numberFormatter = new Intl.NumberFormat("en-IN");
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function DashboardCards({ summary }: DashboardCardsProps) {
  const cards = useMemo(
    () => [
      {
        id: "total-purchased",
        title: "Total Purchased",
        value: numberFormatter.format(summary.totalVehiclesPurchased || 0),
      },
      {
        id: "total-sold",
        title: "Total Sold",
        value: numberFormatter.format(summary.totalVehiclesSold || 0),
      },
      {
        id: "available",
        title: "Available",
        value: numberFormatter.format(summary.availableVehicles || 0),
      },
      {
        id: "total-profit",
        title: "Total Profit",
        value: currencyFormatter.format(summary.totalProfit || 0),
      },
      {
        id: "sales-this-month",
        title: "Sales This Month",
        value: numberFormatter.format(summary.salesThisMonth || 0),
      },
    ],
    [summary],
  );

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

export default memo(DashboardCards);
