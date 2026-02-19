"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="app-sidebar hidden w-64 flex-none bg-gray-900 lg:flex lg:flex-col">
          <Sidebar />
        </aside>

        {isMobileMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <aside
          className={`app-sidebar fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 transition-transform duration-300 lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="app-content min-w-0 flex-1">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
