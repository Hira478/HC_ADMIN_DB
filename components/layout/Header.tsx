// components/Header.tsx
"use client";

import { useFilters } from "@/contexts/FilterContext";
import { Filter, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

// Custom hook to detect clicks outside a component (unchanged)
const useOnClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const Header = () => {
  const {
    companies,
    availablePeriods,
    selectedCompany,
    //setSelectedCompany,
    period,
    setPeriod,
    loading,
  } = useFilters();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(filterRef, () => setIsFilterOpen(false));

  const handleYearChange = (year: number) => {
    setPeriod({ ...period, year });
  };

  const handleValueChange = (newValue: number) => {
    setPeriod({ ...period, value: newValue });
  };

  const uniqueYears = Array.from(new Set(availablePeriods.map((p) => p.year)));

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
  }));

  const getActiveFilterText = () => {
    // Teks sekarang akan selalu menampilkan nama perusahaan ID 7
    const companyName =
      companies.find((c) => c.id === selectedCompany)?.name || "Loading...";
    const monthName = months.find((m) => m.value === period.value)?.name || "";
    return `${companyName} | ${monthName} ${period.year}`;
  };

  return (
    <header className="flex h-20 w-full items-center justify-between border-b bg-gray-200 bg-white px-6">
      <h1 className="text-xl font-bold text-gray-800">HC Dashboard IFG</h1>

      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 rounded-md border bg-gray-50 p-2 text-sm hover:bg-gray-100"
        >
          <Filter size={16} className="text-gray-600" />
          <span className="font-medium text-gray-800">
            {getActiveFilterText()}
          </span>
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bold text-gray-800">Filter Data</h4>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* --- PERUBAHAN UTAMA DI SINI --- */}
              {/* Dropdown perusahaan dihapus, hanya menyisakan tahun */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Tahun
                </label>
                <select
                  value={period.year}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full mt-1 rounded-md border bg-white p-2 text-sm"
                >
                  {uniqueYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Bulanan */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Bulan
                </label>
                <div className="mt-1">
                  <select
                    value={period.value}
                    onChange={(e) => handleValueChange(Number(e.target.value))}
                    className="w-full rounded-md border p-2 text-sm"
                  >
                    {months.map((m) => {
                      const isAvailable = availablePeriods.some(
                        (p) => p.year === period.year && p.month === m.value
                      );
                      return (
                        <option
                          key={m.value}
                          value={m.value}
                          disabled={!isAvailable}
                          className={!isAvailable ? "text-gray-400" : ""}
                        >
                          {m.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
