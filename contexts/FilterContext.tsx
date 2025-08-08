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
        const defaultCompanyId = 7; // <-- Tentukan ID default yang Anda inginkan

        // Cari apakah perusahaan dengan ID default ada di dalam daftar
        const defaultCompany = companyData.find(
          (c: Company) => c.id === defaultCompanyId
        );

        if (defaultCompany) {
          // Jika ditemukan, set sebagai default
          setSelectedCompany(defaultCompany.id);
        } else if (companyData.length > 0) {
          // Jika tidak ditemukan, fallback ke perusahaan pertama (agar tidak error)
          setSelectedCompany(companyData[0].id);
        }
        // ---------------------------------
        if (periodData.length > 0) {
          setPeriod((prev) => ({
            ...prev,
            year: periodData[0].year,
            value: periodData[0].month,
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
    setSelectedCompany,
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
