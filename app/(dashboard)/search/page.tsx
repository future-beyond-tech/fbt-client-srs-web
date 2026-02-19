"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchResultsTable from "@/components/tables/SearchResultsTable";
import SearchInput from "@/components/ui/SearchInput";
import useDebounce from "@/hooks/useDebounce";
import { search } from "@/services/search.service";
import type { SearchResult } from "@/types/search";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 500;

function areSearchResultsEqual(current: SearchResult[], next: SearchResult[]): boolean {
  if (current.length !== next.length) {
    return false;
  }

  for (let index = 0; index < current.length; index += 1) {
    const left = current[index];
    const right = next[index];

    if (
      left.billNumber !== right.billNumber ||
      left.customerName !== right.customerName ||
      left.customerPhone !== right.customerPhone ||
      left.vehicle !== right.vehicle ||
      left.registrationNumber !== right.registrationNumber ||
      left.saleDate !== right.saleDate
    ) {
      return false;
    }
  }

  return true;
}

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [manualKeyword, setManualKeyword] = useState<string | null>(null);
  const [searchVersion, setSearchVersion] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const debouncedKeyword = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);
  const activeKeyword = useMemo(
    () => (manualKeyword !== null ? manualKeyword : debouncedKeyword),
    [debouncedKeyword, manualKeyword],
  );

  useEffect(() => {
    const trimmedKeyword = activeKeyword.trim();

    if (trimmedKeyword.length < MIN_SEARCH_LENGTH) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    const loadingTimer = setTimeout(() => {
      if (requestId === requestIdRef.current) {
        setIsLoading(true);
      }
    }, 0);

    void search(trimmedKeyword, controller.signal)
      .then((response) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults((current) => (areSearchResultsEqual(current, response) ? current : response));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to fetch search records.";
        setErrorMessage(message);
        setResults((current) => (current.length ? [] : current));
      })
      .finally(() => {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [activeKeyword, searchVersion]);

  const hasSearched =
    query.trim().length >= MIN_SEARCH_LENGTH && activeKeyword.length >= MIN_SEARCH_LENGTH;
  const memoizedResults = useMemo(() => results, [results]);

  const handleQueryChange = useCallback((nextValue: string) => {
    setQuery(nextValue);
    setManualKeyword(null);
    setErrorMessage((current) => (current ? "" : current));
  }, []);

  const handleSearchNow = useCallback(() => {
    const immediateKeyword = query.trim();
    setManualKeyword(immediateKeyword);
    setSearchVersion((current) => current + 1);
  }, [query]);

  const handleClear = useCallback(() => {
    requestIdRef.current += 1;
    setQuery("");
    setManualKeyword(null);
    setResults((current) => (current.length ? [] : current));
    setErrorMessage((current) => (current ? "" : current));
    setIsLoading(false);
  }, []);

  const handleSelectBill = useCallback(
    (billNumber: string) => {
      router.push(`/sales/${encodeURIComponent(billNumber)}`);
    },
    [router],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <SearchInput
            value={query}
            isLoading={isLoading && hasSearched}
            onChange={handleQueryChange}
            onSearchNow={handleSearchNow}
            onClear={handleClear}
          />
        </div>

        <section className="mt-6 min-h-[320px] overflow-hidden rounded-xl bg-white shadow-sm md:min-h-[420px]">
          {errorMessage ? (
            <div className="flex min-h-[260px] items-center justify-center p-6">
              <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleSearchNow}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-100 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <SearchResultsTable
              results={memoizedResults}
              isLoading={isLoading}
              hasSearched={hasSearched}
              onSelectBill={handleSelectBill}
            />
          )}
        </section>
      </div>
    </main>
  );
}
