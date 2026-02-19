"use client";

type SearchInputProps = {
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSearchNow: () => void;
  onClear: () => void;
};

export default function SearchInput({
  value,
  isLoading = false,
  onChange,
  onSearchNow,
  onClear,
}: SearchInputProps) {
  return (
    <div className="relative">
      <label htmlFor="global-search" className="sr-only">
        Search sales
      </label>

      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>

      <input
        id="global-search"
        type="text"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearchNow();
          }
        }}
        placeholder="Search by bill number, customer name, phone, vehicle..."
        className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-20 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
        {isLoading ? (
          <span
            className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
            aria-label="Searching"
            role="status"
          />
        ) : null}

        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
