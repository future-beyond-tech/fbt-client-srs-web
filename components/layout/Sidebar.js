"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/purchases", label: "Purchases" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/billing", label: "Billing" },
  { href: "/search", label: "Search" },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-800 px-6 py-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-300">
          SRS Dealership
        </p>
        <p className="mt-2 text-lg font-semibold text-white">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex min-h-[44px] items-center rounded-lg border-l-4 px-3 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-500 bg-gray-800 text-white"
                      : "border-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
