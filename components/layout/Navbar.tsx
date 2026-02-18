"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

type NavbarProps = {
  onMenuClick?: () => void;
};

const routeTitles: Array<{ prefix: string; title: string }> = [
  { prefix: "/dashboard", title: "Dashboard" },
  { prefix: "/vehicles", title: "Vehicles" },
  { prefix: "/sales", title: "Sales" },
  { prefix: "/search", title: "Search" },
];

function getPageTitle(pathname: string): string {
  const match = routeTitles.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );

  if (match) {
    return match.title;
  }

  return "Dashboard";
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    logout();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h1 className="truncate text-lg font-semibold text-gray-900">{getPageTitle(pathname)}</h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Logout"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
