"use client";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="app-navbar sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
          aria-label="Open navigation"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex-1 lg:flex-none">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Shree Ramalingam Sons Billing
          </h1>
        </div>

        <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:block">
          Dealership Workflow Demo
        </div>
      </div>
    </header>
  );
}
