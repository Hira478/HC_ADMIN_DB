// components/layout/Header.tsx
"use client";

import { useFilters } from "@/contexts/FilterContext";
import Link from "next/link";
import {
  Filter,
  X,
  User as UserIcon,
  MonitorPlay,
  MonitorOff,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

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
    setSelectedCompany, // <-- Ambil fungsi ini
    period,
    setPeriod,
    user,
    isSlideshowMode,
    toggleSlideshowMode,
  } = useFilters();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useOnClickOutside(filterRef, () => setIsFilterOpen(false));

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompany(companyId);
  };
  const handleYearChange = (newYear: number) => {
    // Cari bulan terbaru yang tersedia untuk tahun yang baru dipilih
    const monthsForNewYear = availablePeriods
      .filter((p) => p.year === newYear)
      .map((p) => p.month);

    if (monthsForNewYear.length > 0) {
      // Set bulan ke yang paling tinggi (terbaru) di tahun tersebut
      const latestMonthInNewYear = Math.max(...monthsForNewYear);
      setPeriod({ ...period, year: newYear, value: latestMonthInNewYear });
    } else {
      // Fallback jika tidak ada bulan yang tersedia (seharusnya tidak terjadi)
      setPeriod({ ...period, year: newYear });
    }
  };
  const handleValueChange = (newValue: number) => {
    setPeriod({ ...period, value: newValue });
  };

  const uniqueYears = Array.from(new Set(availablePeriods.map((p) => p.year)));
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  const getActiveFilterText = () => {
    const companyName =
      companies.find((c) => c.id === selectedCompany)?.name || "Loading...";
    const monthName = months.find((m) => m.value === period.value)?.name || "";
    return `${companyName} | ${monthName} ${period.year}`;
  };

  return (
    <header className="flex h-20 w-full items-center justify-between bg-white px-6">
      <div className="flex items-center">
        {/* Hanya render jika 'selectedCompany' sudah ada nilainya */}
        {selectedCompany && (
          <Image
            key={selectedCompany} // <-- Key untuk re-render saat logo berubah
            src={`/logos/${selectedCompany}.png`} // <-- Path dinamis berdasarkan ID
            alt="Company Logo"
            width={120} // Sesuaikan ukurannya
            height={40} // Sesuaikan ukurannya
            priority // Prioritaskan load logo
            style={{ objectFit: "contain" }} // Pastikan gambar tidak gepeng
            unoptimized
          />
        )}
      </div>
      <div className="flex items-center gap-6">
        {isClient && (
          <>
            <Link href="/slideshow" title="Start Slideshow">
              <div className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <MonitorPlay size={20} />
              </div>
            </Link>
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
                    <h4 className="font-bold text-gray-800">Filter</h4>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* --- KONDISIONAL DROPDOWN PERUSAHAAN --- */}
                    {(user?.role === "ADMIN_HOLDING" ||
                      user?.role === "SUPER_ADMIN") && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Perusahaan
                        </label>
                        <select
                          value={selectedCompany ?? ""}
                          onChange={(e) =>
                            handleCompanyChange(Number(e.target.value))
                          }
                          className="w-full mt-1 rounded-md border bg-white p-2 text-sm"
                        >
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Year
                      </label>
                      <select
                        value={period.year}
                        onChange={(e) =>
                          handleYearChange(Number(e.target.value))
                        }
                        className="w-full mt-1 rounded-md border bg-white p-2 text-sm"
                      >
                        {uniqueYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Month
                      </label>
                      <div className="mt-1">
                        <select
                          value={period.value}
                          onChange={(e) =>
                            handleValueChange(Number(e.target.value))
                          }
                          className="w-full rounded-md border p-2 text-sm"
                        >
                          {months.map((m) => {
                            const isAvailable = availablePeriods.some(
                              (p) =>
                                p.year === period.year && p.month === m.value
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
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
