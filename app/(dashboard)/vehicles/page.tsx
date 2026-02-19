"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import VehicleTable from "@/components/tables/VehicleTable";
import Pagination from "@/components/ui/Pagination";
import { isRequestCanceled } from "@/services/error-handler";
import { getVehicles } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

const ITEMS_PER_PAGE = 10;
const MAX_RENDERABLE_VEHICLES = 1000;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchVehicles = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    try {
      const list = await getVehicles(signal);
      setVehicles(list);
    } catch (requestError) {
      if (isRequestCanceled(requestError)) {
        return;
      }

      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch vehicles. Please try again.";
      setError(message);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchVehicles(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchVehicles]);

  const safeVehicles = useMemo(
    () =>
      vehicles.length > MAX_RENDERABLE_VEHICLES
        ? vehicles.slice(0, MAX_RENDERABLE_VEHICLES)
        : vehicles,
    [vehicles],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(safeVehicles.length / ITEMS_PER_PAGE)),
    [safeVehicles.length],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return safeVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [safeVehicles, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Vehicles</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your dealership inventory and status in one place.
            </p>
          </div>

          <Link
            href="/purchases"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            + Add Purchase
          </Link>
        </header>

        {!isLoading && error ? (
          <section className="flex min-h-[300px] items-center justify-center">
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
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Couldn&apos;t load vehicles
              </h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <button
                type="button"
                onClick={() => void fetchVehicles()}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Retry
              </button>
            </article>
          </section>
        ) : (
          <>
            <VehicleTable vehicles={paginatedVehicles} isLoading={isLoading} />

            {!isLoading && safeVehicles.length > ITEMS_PER_PAGE ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
