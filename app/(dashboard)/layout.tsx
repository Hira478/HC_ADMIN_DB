// File: app/(dashboard)/layout.tsx
"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { FilterProvider, useFilters } from "@/contexts/FilterContext";
import React from "react";
import { usePathname } from "next/navigation"; // <-- 1. Import usePathname

function DashboardUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // <-- 2. Dapatkan path URL saat ini

  // 3. Cek apakah kita sedang di halaman slideshow
  const isSlideshowPage = pathname === "/slideshow";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sembunyikan jika ini halaman slideshow */}
      <div className={isSlideshowPage ? "hidden" : ""}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sembunyikan jika ini halaman slideshow */}
        <Header />

        <main
          id="main-content"
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 ${
            isSlideshowPage ? "p-0" : "p-6"
          }`}
        >
          {children}
        </main>

        {/* Sembunyikan jika ini halaman slideshow */}
        <div className={isSlideshowPage ? "hidden" : ""}>
          <footer className="text-right text-xs text-gray-500 p-4 bg-white">
            <i>
              Seluruh Data telah Diverifikasi oleh Pejabat Berwenang dari
              Masing-Masing Entitas Perusahaan.
            </i>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <DashboardUI>{children}</DashboardUI>
    </FilterProvider>
  );
}
