"use client";

import { useMemo, useState } from "react";
import { getVehicleStatusLabel } from "@/types/enums";
import type { Vehicle } from "@/types/vehicle";

type VehicleDropdownProps = {
  vehicles: Vehicle[];
  selectedVehicleId: number | null;
  onSelect: (vehicleId: number) => void;
  error?: string;
  loading?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

export default function VehicleDropdown({
  vehicles,
  selectedVehicleId,
  onSelect,
  error,
  loading = false,
}: VehicleDropdownProps) {
  const [query, setQuery] = useState("");

  const filteredVehicles = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      `${vehicle.brand} ${vehicle.model} ${vehicle.registrationNumber}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [vehicles, query]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="vehicleSearch" className="text-sm font-medium text-gray-700">
          Search Vehicle
        </label>
        <input
          id="vehicleSearch"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by brand, model, or registration"
          className="min-h-[44px] w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="vehicleId" className="text-sm font-medium text-gray-700">
          Select Vehicle
        </label>
        <select
          id="vehicleId"
          value={selectedVehicleId ? String(selectedVehicleId) : ""}
          onChange={(event) => {
            const vehicleId = Number(event.target.value);
            if (vehicleId) {
              onSelect(vehicleId);
            }
          }}
          disabled={loading}
          className={`min-h-[44px] w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
          } disabled:cursor-not-allowed disabled:bg-gray-100`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "vehicleId-error" : undefined}
        >
          <option value="">Choose available vehicle</option>
          {filteredVehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.brand} {vehicle.model} ({vehicle.registrationNumber})
            </option>
          ))}
        </select>
        {error ? (
          <p id="vehicleId-error" className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      {selectedVehicle ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedVehicle.brand} {selectedVehicle.model}
              </p>
              <p className="break-words text-xs text-gray-600">
                {selectedVehicle.registrationNumber}
              </p>
            </div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {getVehicleStatusLabel(selectedVehicle.status)}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Selling Price:{" "}
            <span className="font-semibold text-gray-900">
              {formatCurrency(selectedVehicle.sellingPrice)}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
