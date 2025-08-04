"use client";

import { useFilters, Period } from "@/contexts/FilterContext";
import { Filter, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

// Custom hook to detect clicks outside a component (unchanged)
const useOnClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
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
    selectedCompany,
    setSelectedCompany,
    period,
    setPeriod,
    loading,
  } = useFilters();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(filterRef, () => setIsFilterOpen(false));

  // Handler for changing the period type from radio buttons
  const handleTypeChange = (newType: Period["type"]) => {
    // When the type changes, reset its value to 1 (e.g., January, Q1, 1st Semester)
    setPeriod({ ...period, type: newType, value: 1 });
  };

  // Handler for changing the value from the active dropdown
  const handleValueChange = (newValue: number) => {
    setPeriod({ ...period, value: newValue });
  };

  const handleYearChange = (year: number) => {
    setPeriod({ ...period, year });
  };

  // Options for the dropdowns in English
  const years = [2025, 2024, 2023];
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  const quarters = [
    { value: 1, name: "Q1" },
    { value: 2, name: "Q2" },
    { value: 3, name: "Q3" },
    { value: 4, name: "Q4" },
  ];
  const semesters = [
    { value: 1, name: "1st Semester" },
    { value: 2, name: "2nd Semester" },
  ];

  // Function to display the currently active filter text
  const getActiveFilterText = () => {
    const companyName =
      companies.find((c) => c.id === selectedCompany)?.name || "Select Company";
    let periodText = "";
    switch (period.type) {
      case "monthly":
        periodText = months.find((m) => m.value === period.value)?.name || "";
        break;
      case "quarterly":
        periodText = `Q${period.value}`;
        break;
      case "semesterly":
        periodText =
          semesters.find((s) => s.value === period.value)?.name || "";
        break;
      case "yearly":
        periodText = "Annual";
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
          className="flex items-center space-x-2 rounded-md border p-2 text-sm bg-gray-50 hover:bg-gray-100"
        >
          <Filter size={16} className="text-gray-600" />
          <span className="text-gray-800 font-medium">
            {getActiveFilterText()}
          </span>
        </button>

        {isFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 rounded-lg border bg-white shadow-xl z-20 p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800">Data Filters</h4>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                {" "}
                <X size={18} />{" "}
              </button>
            </div>

            <div className="space-y-4">
              {/* Company & Year Filters */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  disabled={loading}
                  className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
                >
                  {loading ? (
                    <option>Loading...</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Year
                </label>
                <select
                  value={period.year}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Filter with Radio Buttons */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Period
                </label>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "monthly"}
                      onChange={() => handleTypeChange("monthly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Monthly</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "quarterly"}
                      onChange={() => handleTypeChange("quarterly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Quarterly</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "semesterly"}
                      onChange={() => handleTypeChange("semesterly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Semester</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      checked={period.type === "yearly"}
                      onChange={() => handleTypeChange("yearly")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yearly</span>
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
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {period.type === "quarterly" && (
                    <select
                      value={period.value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value))
                      }
                      className="w-full rounded-md border p-2 text-sm"
                    >
                      {quarters.map((q) => (
                        <option key={q.value} value={q.value}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {period.type === "semesterly" && (
                    <select
                      value={period.value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value))
                      }
                      className="w-full rounded-md border p-2 text-sm"
                    >
                      {semesters.map((s) => (
                        <option key={s.value} value={s.value}>
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
