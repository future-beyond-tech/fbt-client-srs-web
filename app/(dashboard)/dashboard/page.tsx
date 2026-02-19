"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardCards from "@/components/dashboard/DashboardCards";
import { getDashboardSummary, type DashboardSummary } from "@/services/dashboard.service";
import { isRequestCanceled } from "@/services/error-handler";

const initialSummary: DashboardSummary = {
  totalVehiclesPurchased: 0,
  totalVehiclesSold: 0,
  availableVehicles: 0,
  totalProfit: 0,
  salesThisMonth: 0,
};

function DashboardSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-200" />
        </article>
      ))}
    </section>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDashboardSummary(signal);
      setSummary(response);
    } catch (requestError) {
      if (isRequestCanceled(requestError)) {
        return;
      }

      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dashboard summary.";
      setError(message);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchDashboard(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDashboard]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Live summary of purchases, sales, and profit.</p>
        </header>

        {isLoading ? <DashboardSkeleton /> : null}

        {!isLoading && error ? (
          <section className="flex min-h-[300px] items-center justify-center">
            <article className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Unable to load dashboard</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <button
                type="button"
                onClick={() => void fetchDashboard()}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Retry
              </button>
            </article>
          </section>
        ) : null}

        {!isLoading && !error ? <DashboardCards summary={summary} /> : null}
      </div>
    </main>
  );
}
