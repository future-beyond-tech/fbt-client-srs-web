"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type IconProps = {
  className?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

type SidebarProps = {
  onNavigate?: () => void;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/vehicles", label: "Vehicles", icon: VehicleIcon },
  { href: "/sales", label: "Sales", icon: SalesIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
];

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-800 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
          SRS Dealership
        </p>
        <p className="mt-2 text-base font-semibold text-white">Admin Console</p>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-2 py-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 border-l-4 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "border-blue-500 bg-gray-800 text-white"
                      : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-none" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12.5C4 9.9 4 8.6 4.8 7.7C5.6 6.8 6.8 6.8 9.2 6.8H14.8C17.2 6.8 18.4 6.8 19.2 7.7C20 8.6 20 9.9 20 12.5V14.8C20 17.2 20 18.4 19.2 19.2C18.4 20 17.2 20 14.8 20H9.2C6.8 20 5.6 20 4.8 19.2C4 18.4 4 17.2 4 14.8V12.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4.3 10.2H19.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 6.8V20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function VehicleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 14.5L6.3 9.8C6.7 8.8 7 8.3 7.4 8.1C7.8 7.8 8.4 7.8 9.5 7.8H14.5C15.6 7.8 16.2 7.8 16.6 8.1C17 8.3 17.3 8.8 17.7 9.8L19.5 14.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5.5 14.5H18.5C19.3 14.5 20 15.2 20 16V16.8C20 17.6 19.3 18.3 18.5 18.3H5.5C4.7 18.3 4 17.6 4 16.8V16C4 15.2 4.7 14.5 5.5 14.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="7.5" cy="16.5" r="1" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SalesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 18V10.5M12 18V6M19 18V13.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4 18.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16L20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
