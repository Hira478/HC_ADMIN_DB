"use client";

import { useFilters, Period } from "@/contexts/FilterContext";
import { Filter, X } from "lucide-react";
import React, { useState, useRef, useEffect, useMemo } from "react";

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
    setSelectedCompany,
    period,
    setPeriod,
    loading,
  } = useFilters();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(filterRef, () => setIsFilterOpen(false));

  // <<< MULAI PERUBAHAN LOGIKA: Kalkulasi ketersediaan periode >>>
  const { quarterAvailability, semesterAvailability, isYearlyAvailable } =
    useMemo(() => {
      // Ambil bulan yang tersedia hanya untuk tahun yang sedang dipilih
      const availableMonthsForYear = new Set(
        availablePeriods
          .filter((p) => p.year === period.year)
          .map((p) => p.month)
      );

      // Fungsi untuk mengecek jika semua bulan dalam array ada di Set
      const checkAllMonthsAvailable = (months: number[]) =>
        months.every((month) => availableMonthsForYear.has(month));

      return {
        quarterAvailability: {
          1: checkAllMonthsAvailable([1, 2, 3]),
          2: checkAllMonthsAvailable([4, 5, 6]),
          3: checkAllMonthsAvailable([7, 8, 9]),
          4: checkAllMonthsAvailable([10, 11, 12]),
        },
        semesterAvailability: {
          1: checkAllMonthsAvailable([1, 2, 3, 4, 5, 6]),
          2: checkAllMonthsAvailable([7, 8, 9, 10, 11, 12]),
        },
        isYearlyAvailable: availableMonthsForYear.size === 12,
      };
    }, [availablePeriods, period.year]);
  // <<< AKHIR PERUBAHAN LOGIKA >>>

  const handleTypeChange = (newType: Period["type"]) => {
    setPeriod({ ...period, type: newType, value: 1 });
  };

  const handleValueChange = (newValue: number) => {
    setPeriod({ ...period, value: newValue });
  };

  const handleYearChange = (year: number) => {
    setPeriod({ ...period, year });
  };

  const uniqueYears = Array.from(new Set(availablePeriods.map((p) => p.year)));

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
  }));
  const quarters = [
    { value: 1, name: "Q1 (Jan-Mar)" },
    { value: 2, name: "Q2 (Apr-Jun)" },
    { value: 3, name: "Q3 (Jul-Sep)" },
    { value: 4, name: "Q4 (Okt-Des)" },
  ];
  const semesters = [
    { value: 1, name: "Semester 1 (Jan-Jun)" },
    { value: 2, name: "Semester 2 (Jul-Des)" },
  ];

  const getActiveFilterText = () => {
    const companyName =
      companies.find((c) => c.id === selectedCompany)?.name ||
      "Pilih Perusahaan";
    let periodText = "";
    switch (period.type) {
      case "monthly":
        periodText = months.find((m) => m.value === period.value)?.name || "";
        break;
      case "quarterly":
        periodText = `Q${period.value}`;
        break;
      case "semesterly":
        periodText = `Semester ${period.value}`;
        break;
      case "yearly":
        periodText = "Tahunan";
        break;
    }
    const valueText = period.type === "yearly" ? "" : periodText;
    return `${companyName} | ${valueText} ${period.year}`;
  };

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
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
              {/* Company & Year Filters */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCompany ?? ""}
                  onChange={(e) => setSelectedCompany(Number(e.target.value))}
                  disabled={loading}
                  className="w-full rounded-md border bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Perusahaan</option>
                  {loading ? (
                    <option>Memuat...</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
                <select
                  value={period.year}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full rounded-md border bg-white p-2 text-sm"
                >
                  {uniqueYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Filter with Radio Buttons */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Periode
                </label>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "monthly"}
                      onChange={() => handleTypeChange("monthly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bulanan</span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "quarterly"}
                      onChange={() => handleTypeChange("quarterly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Kuartal</span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "semesterly"}
                      onChange={() => handleTypeChange("semesterly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Semester</span>
                  </label>
                  {/* <<< PERUBAHAN: Tambahkan disabled dan style pada radio button Yearly >>> */}
                  <label
                    className={`flex items-center space-x-2 ${
                      !isYearlyAvailable
                        ? "cursor-not-allowed text-gray-400"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "yearly"}
                      onChange={() => handleTypeChange("yearly")}
                      disabled={!isYearlyAvailable}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tahunan</span>
                  </label>
                </div>

                {/* Conditionally Rendered Dropdowns */}
                <div className="mt-2">
                  {period.type === "monthly" && (
                    <select
                      value={period.value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value))
                      }
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
                  )}
                  {/* <<< PERUBAHAN: Tambahkan disabled pada dropdown Kuartal >>> */}
                  {period.type === "quarterly" && (
                    <select
                      value={period.value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value))
                      }
                      className="w-full rounded-md border p-2 text-sm"
                    >
                      {quarters.map((q) => (
                        <option
                          key={q.value}
                          value={q.value}
                          disabled={
                            !quarterAvailability[
                              q.value as keyof typeof quarterAvailability
                            ]
                          }
                          className={
                            !quarterAvailability[
                              q.value as keyof typeof quarterAvailability
                            ]
                              ? "text-gray-400"
                              : ""
                          }
                        >
                          {q.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {/* <<< PERUBAHAN: Tambahkan disabled pada dropdown Semester >>> */}
                  {period.type === "semesterly" && (
                    <select
                      value={period.value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value))
                      }
                      className="w-full rounded-md border p-2 text-sm"
                    >
                      {semesters.map((s) => (
                        <option
                          key={s.value}
                          value={s.value}
                          disabled={
                            !semesterAvailability[
                              s.value as keyof typeof semesterAvailability
                            ]
                          }
                          className={
                            !semesterAvailability[
                              s.value as keyof typeof semesterAvailability
                            ]
                              ? "text-gray-400"
                              : ""
                          }
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
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
