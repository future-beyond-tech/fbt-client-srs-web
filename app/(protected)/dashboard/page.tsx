"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardCards, {
  type DashboardMetrics,
} from "@/components/dashboard/DashboardCards";

type DashboardApiResponse = DashboardMetrics;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialMetrics: DashboardMetrics = {
  totalVehicles: 0,
  soldVehicles: 0,
  availableVehicles: 0,
  totalProfit: 0,
  salesThisMonth: 0,
};

export default function ProtectedDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (signal?: AbortSignal) => {
    if (!API_URL) {
      setError("Dashboard service is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const payload = (await response.json()) as DashboardApiResponse;
      setMetrics({
        totalVehicles: Number(payload.totalVehicles) || 0,
        soldVehicles: Number(payload.soldVehicles) || 0,
        availableVehicles: Number(payload.availableVehicles) || 0,
        totalProfit: Number(payload.totalProfit) || 0,
        salesThisMonth: Number(payload.salesThisMonth) || 0,
      });
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }
      setError("Unable to fetch dashboard summary right now.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
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
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time dealership performance summary.
          </p>
        </header>

        {loading ? <DashboardCardsSkeleton /> : null}

        {!loading && error ? (
          <section className="flex min-h-[280px] items-center justify-center">
            <article className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 8V12M12 16H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21H20.47A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load dashboard</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>

              <button
                type="button"
                onClick={() => void fetchDashboard()}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Retry
              </button>
            </article>
          </section>
        ) : null}

        {!loading && !error ? <DashboardCards data={metrics} /> : null}
      </div>
    </main>
  );
}

function DashboardCardsSkeleton() {
  return (
    <section aria-label="Loading dashboard cards">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <article
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="mt-4 h-8 w-24 animate-pulse rounded bg-gray-200" />
          </article>
        ))}
      </div>
    </section>
  );
}
