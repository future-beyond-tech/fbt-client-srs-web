"use client";

import { memo, useMemo } from "react";
import type { SearchResult } from "@/types/search";

type SearchResultsTableProps = {
  results: SearchResult[];
  isLoading: boolean;
  hasSearched: boolean;
  onSelectBill: (billNumber: string) => void;
};

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function LoadingState() {
  return (
    <>
      <div className="hidden max-h-[65vh] overflow-auto md:block">
        <table className="min-w-[860px] w-full">
          <thead className="bg-gray-100">
            <tr>
              {Array.from({ length: 6 }).map((_, index) => (
                <th key={index} className="sticky top-0 z-10 bg-gray-100 px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="border-t border-gray-100">
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4">
                    <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6">
      <p className="text-center text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

function SearchResultsTable({
  results,
  isLoading,
  hasSearched,
  onSelectBill,
}: SearchResultsTableProps) {
  const preparedResults = useMemo(
    () =>
      results.map((record) => ({
        ...record,
        formattedSaleDate: formatDate(record.saleDate),
      })),
    [results],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasSearched) {
    return <EmptyState message="Start typing to search bills" />;
  }

  if (results.length === 0) {
    return <EmptyState message="No matching records found" />;
  }

  return (
    <>
      <div className="hidden max-h-[65vh] overflow-auto md:block">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">
                Bill Number
              </th>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">
                Customer Name
              </th>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">Phone</th>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">Vehicle</th>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">
                Registration Number
              </th>
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 font-medium">
                Sale Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {preparedResults.map((record) => (
              <tr
                key={`${record.billNumber}-${record.registrationNumber}-${record.saleDate}`}
                onClick={() => onSelectBill(record.billNumber)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectBill(record.billNumber);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open bill ${record.billNumber}`}
                className="cursor-pointer transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              >
                <td className="px-4 py-3 font-semibold text-gray-900">{record.billNumber}</td>
                <td className="px-4 py-3 text-gray-900">{record.customerName || "-"}</td>
                <td className="px-4 py-3 text-gray-900">{record.customerPhone || "-"}</td>
                <td className="px-4 py-3 text-gray-900">{record.vehicle || "-"}</td>
                <td className="px-4 py-3 text-gray-900">{record.registrationNumber || "-"}</td>
                <td className="px-4 py-3 text-gray-900">{record.formattedSaleDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {preparedResults.map((record) => (
          <button
            key={`${record.billNumber}-${record.registrationNumber}-${record.saleDate}-mobile`}
            type="button"
            onClick={() => onSelectBill(record.billNumber)}
            className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <p className="text-base font-semibold text-gray-900">{record.billNumber}</p>

            <div className="mt-3 space-y-2">
              <Row label="Customer" value={record.customerName || "-"} />
              <Row label="Phone" value={record.customerPhone || "-"} />
              <Row label="Vehicle" value={record.vehicle || "-"} />
              <Row label="Registration" value={record.registrationNumber || "-"} />
              <Row label="Sale Date" value={record.formattedSaleDate} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

export default memo(SearchResultsTable);

type RowProps = {
  label: string;
  value: string;
};

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-right text-gray-900">{value}</p>
    </div>
  );
}
