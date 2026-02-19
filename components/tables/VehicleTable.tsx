import { memo, useMemo } from "react";
import Link from "next/link";
import { VEHICLE_STATUS, getVehicleStatusLabel } from "@/types/enums";
import type { Vehicle } from "@/types/vehicle";

type VehicleTableProps = {
  vehicles: Vehicle[];
  isLoading: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

function statusClass(status: number): string {
  return status === VEHICLE_STATUS.Available
    ? "bg-green-100 text-green-700"
    : "bg-gray-200 text-gray-700";
}

function VehicleTable({ vehicles, isLoading }: VehicleTableProps) {
  const preparedVehicles = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        formattedPrice: formatCurrency(vehicle.sellingPrice),
      })),
    [vehicles],
  );

  if (isLoading) {
    return <VehicleTableSkeleton />;
  }

  if (!vehicles.length) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
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
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">No vehicles available</h2>
        <p className="mt-2 text-sm text-gray-600">Add your first purchase to start inventory.</p>

        <Link
          href="/purchases"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Purchase
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Registration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Selling Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {preparedVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="transition hover:bg-gray-50">
                  <td className="max-w-[160px] truncate px-4 py-3 text-sm font-medium text-gray-900">
                    {vehicle.brand}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-sm text-gray-700">
                    {vehicle.model}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{vehicle.year}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-700">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {vehicle.formattedPrice}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                        vehicle.status,
                      )}`}
                    >
                      {getVehicleStatusLabel(vehicle.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {preparedVehicles.map((vehicle) => (
            <article key={vehicle.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                    vehicle.status,
                  )}`}
                >
                  {getVehicleStatusLabel(vehicle.status)}
                </span>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-gray-500">Year</dt>
                  <dd className="font-medium text-gray-900">{vehicle.year}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-gray-500">Registration</dt>
                  <dd className="truncate font-medium text-gray-900">
                    {vehicle.registrationNumber}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-medium text-gray-900">{vehicle.formattedPrice}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(VehicleTable);

function VehicleTableSkeleton() {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-100">
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
