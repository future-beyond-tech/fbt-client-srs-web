"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BillLayout from "@/components/bill/BillLayout";
import { isRequestCanceled } from "@/services/error-handler";
import { getSaleByBillNumber } from "@/services/sales.service";
import type { SaleDetails } from "@/types/sale";

function BillSkeleton() {
  return (
    <main className="bill-print-page min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <div className="mb-4 flex justify-end">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
        </div>

        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-52 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-200 pb-6">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-40 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-200 pb-6">
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded bg-gray-200" />
              <div className="h-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SaleBillPage() {
  const params = useParams<{ billNumber: string }>();
  const [sale, setSale] = useState<SaleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const billNumber = useMemo(() => {
    const rawValue = params?.billNumber;
    if (Array.isArray(rawValue)) {
      return rawValue[0] ?? "";
    }
    return rawValue ?? "";
  }, [params]);

  const fetchSale = useCallback(
    async (signal?: AbortSignal) => {
      if (!billNumber) {
        setErrorMessage("Invalid bill number.");
        setSale(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getSaleByBillNumber(billNumber, signal);
        setSale(response);
      } catch (error) {
        if (isRequestCanceled(error)) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to load bill details.";
        setErrorMessage(message);
        setSale(null);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [billNumber],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchSale(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchSale]);

  if (isLoading) {
    return <BillSkeleton />;
  }

  if (errorMessage || !sale) {
    return (
      <main className="bill-print-page min-h-screen bg-gray-100">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                <path
                  d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-lg font-semibold text-gray-900">Unable to load bill</h1>
            <p className="mt-2 text-sm text-gray-600">
              {errorMessage || "Bill details are not available right now."}
            </p>

            <button
              type="button"
              onClick={() => void fetchSale()}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bill-print-page min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <div className="no-print mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => window.print()}
            className="bill-print-btn inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Print
          </button>
        </div>

        <BillLayout sale={sale} />
      </div>
    </main>
  );
}
