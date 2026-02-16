"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="app-sidebar hidden w-72 flex-none border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <Sidebar />
        </aside>

        {isMobileMenuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="app-content flex-1 px-4 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>

          <footer className="app-footer border-t border-slate-200 bg-white px-4 py-4 text-center text-xs font-medium text-slate-500 sm:px-6 lg:px-10">
            Powered by Future Beyond Tech
          </footer>
        </div>
      </div>
    </div>
  );
}
