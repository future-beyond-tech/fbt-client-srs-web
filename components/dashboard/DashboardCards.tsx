import type { ReactNode } from "react";

export type DashboardMetrics = {
  totalVehicles: number;
  soldVehicles: number;
  availableVehicles: number;
  totalProfit: number;
  salesThisMonth: number;
};

type DashboardCardsProps = {
  data: DashboardMetrics;
};

type MetricCard = {
  key: keyof DashboardMetrics;
  label: string;
  icon: ReactNode;
  format: (value: number) => string;
};

const numberFormatter = new Intl.NumberFormat();
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const iconClassName = "h-5 w-5 text-gray-500";

const metricCards: MetricCard[] = [
  {
    key: "totalVehicles",
    label: "Total Vehicles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
        <path
          d="M4.5 14.5L6.3 9.8C6.7 8.8 7 8.3 7.4 8.1C7.8 7.8 8.4 7.8 9.5 7.8H14.5C15.6 7.8 16.2 7.8 16.6 8.1C17 8.3 17.3 8.8 17.7 9.8L19.5 14.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M5.5 14.5H18.5C19.3 14.5 20 15.2 20 16V16.8C20 17.6 19.3 18.3 18.5 18.3H5.5C4.7 18.3 4 17.6 4 16.8V16C4 15.2 4.7 14.5 5.5 14.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
    format: (value) => numberFormatter.format(value),
  },
  {
    key: "soldVehicles",
    label: "Sold",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
        <path
          d="M4 12.5C4 9.9 4 8.6 4.8 7.7C5.6 6.8 6.8 6.8 9.2 6.8H14.8C17.2 6.8 18.4 6.8 19.2 7.7C20 8.6 20 9.9 20 12.5V14.8C20 17.2 20 18.4 19.2 19.2C18.4 20 17.2 20 14.8 20H9.2C6.8 20 5.6 20 4.8 19.2C4 18.4 4 17.2 4 14.8V12.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8.5 12.3L10.8 14.6L15.6 9.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    format: (value) => numberFormatter.format(value),
  },
  {
    key: "availableVehicles",
    label: "Available",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 8V12L14.8 14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    format: (value) => numberFormatter.format(value),
  },
  {
    key: "totalProfit",
    label: "Total Profit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
        <path
          d="M6 15.8L10 11.8L13 14.8L18 9.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.8H18V12.3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    format: (value) => currencyFormatter.format(value),
  },
  {
    key: "salesThisMonth",
    label: "Sales This Month",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
        <path
          d="M7 4.8V7.2M17 4.8V7.2M4.8 9.5H19.2M7.2 20H16.8C18.5 20 19.3 20 19.9 19.5C20.4 18.9 20.4 18.1 20.4 16.4V9.6C20.4 7.9 20.4 7.1 19.9 6.5C19.3 6 18.5 6 16.8 6H7.2C5.5 6 4.7 6 4.1 6.5C3.6 7.1 3.6 7.9 3.6 9.6V16.4C3.6 18.1 3.6 18.9 4.1 19.5C4.7 20 5.5 20 7.2 20Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    format: (value) => numberFormatter.format(value),
  },
];

export default function DashboardCards({ data }: DashboardCardsProps) {
  return (
    <section aria-label="Dashboard summary cards">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article
            key={card.key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                {card.icon}
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              {card.format(data[card.key])}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
