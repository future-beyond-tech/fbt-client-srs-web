"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

const titleMap = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/purchases", title: "Purchases" },
  { path: "/vehicles", title: "Vehicles" },
  { path: "/billing", title: "Billing" },
  { path: "/search", title: "Search" },
  { path: "/sales", title: "Bill View" },
];

export default function Navbar({ onMenuClick }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = useMemo(() => {
    const matched = titleMap.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    );
    return matched?.title ?? "SRS Dealership";
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logout();
  };

  return (
    <header className="app-navbar sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 text-gray-700 lg:hidden"
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

        <div className="min-w-0 flex-1 lg:flex-none">
          <h1 className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
            {pageTitle}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Logout"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
