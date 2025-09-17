// app/(dashboard)/layout.tsx
"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { FilterProvider } from "@/contexts/FilterContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
          <footer className="text-right text-xs text-gray-500 p-4 border-t border-gray-200 bg-white">
            <i>
              Seluruh Data telah Diverifikasi oleh Pejabat Berwenang dari
              Masing-Masing Entitas Perusahaan.
            </i>
          </footer>
        </div>
      </div>
    </FilterProvider>
  );
}
