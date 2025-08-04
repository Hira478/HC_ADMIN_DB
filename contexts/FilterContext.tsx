"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Tipe data baru untuk filter periode
export interface Period {
  type: "monthly" | "quarterly" | "semesterly" | "yearly";
  year: number;
  value: number; // bulan (1-12), quarter (1-4), semester (1-2), atau 1 untuk tahunan
}

interface Company {
  id: string;
  name: string;
}

interface FilterContextType {
  companies: Company[];
  selectedCompany: string;
  setSelectedCompany: (companyId: string) => void;
  period: Period;
  setPeriod: (period: Period) => void;
  loading: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // State baru yang terpadu untuk periode
  const [period, setPeriod] = useState<Period>({
    type: "monthly",
    year: 2025,
    value: 8, // Default: Agustus 2025
  });

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data: Company[]) => {
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0].id);
        setLoading(false);
      });
  }, []);

  const value = {
    companies,
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
