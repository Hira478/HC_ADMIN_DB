"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

export interface Period {
  type: "monthly" | "quarterly" | "semesterly" | "yearly";
  year: number;
  value: number;
}

// Ubah tipe 'id' menjadi 'number'
interface Company {
  id: number;
  name: string;
}

interface FilterContextType {
  companies: Company[];
  availablePeriods: { year: number; month: number }[];
  selectedCompany: number | null; // <-- Sekarang number atau null
  setSelectedCompany: (companyId: number) => void; // <-- Menerima number
  period: Period;
  setPeriod: (period: Period) => void;
  loading: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<
    { year: number; month: number }[]
  >([]);
  // State awal 'null' untuk menandakan belum ada yang dipilih
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>({
    type: "monthly",
    year: new Date("2025-08-06").getFullYear(),
    value: new Date("2025-08-06").getMonth() + 1,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then((res) => res.json()),
      fetch("/api/filters/available-periods").then((res) => res.json()),
    ])
      .then(([companyData, periodData]) => {
        setCompanies(companyData);
        setAvailablePeriods(periodData);

        // --- PERUBAHAN UTAMA DI SINI ---
        const defaultCompanyId = 7;
        setSelectedCompany(defaultCompanyId);

        // --- PERUBAHAN UTAMA DI SINI ---
        if (periodData && periodData.length > 0) {
          // 1. Cari tahun paling baru dari semua periode yang ada
          const latestYear = Math.max(
            ...periodData.map((p: { year: number }) => p.year)
          );

          // 2. Filter periode hanya untuk tahun yang paling baru tersebut
          const periodsInLatestYear = periodData.filter(
            (p: { year: number }) => p.year === latestYear
          );

          // 3. Cari bulan paling baru di dalam tahun tersebut
          const latestMonth = Math.max(
            ...periodsInLatestYear.map((p: { month: number }) => p.month)
          );

          // 4. Set periode default ke tahun dan bulan paling baru
          setPeriod((prev) => ({
            ...prev,
            year: latestYear,
            value: latestMonth,
          }));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch initial filter data:", error);
        setLoading(false);
      });
  }, []);

  const value = {
    companies,
    availablePeriods,
    selectedCompany,
    setSelectedCompany: () => {}, // Fungsi kosong agar tidak bisa diubah
    period,
    setPeriod,
    loading,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
