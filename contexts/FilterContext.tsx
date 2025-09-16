// contexts/FilterContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Tipe Data untuk Sesi User
interface UserSession {
  id: number;
  name: string;
  email: string;
  role: "ADMIN_HOLDING" | "USER_ANPER"; // Dibuat lebih spesifik
  companyId: number;
  companyName: string;
}

export interface Period {
  type: "monthly" | "quarterly" | "semesterly" | "yearly";
  year: number;
  value: number;
}

type AvailablePeriod = {
  year: number;
  month: number;
};

interface Company {
  id: number;
  name: string;
}

interface FilterContextType {
  companies: Company[];
  availablePeriods: AvailablePeriod[];
  selectedCompany: number | null;
  setSelectedCompany: (companyId: number) => void;
  period: Period;
  setPeriod: (period: Period) => void;
  loading: boolean;
  user: UserSession | null;
  logout: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<AvailablePeriod[]>(
    []
  );
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>({
    type: "monthly",
    year: new Date().getFullYear(),
    value: new Date().getMonth() + 1,
  });

  const [user, setUser] = useState<UserSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const initializeDashboard = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok)
          throw new Error("Not authenticated. Redirecting to login.");
        const userData: UserSession = await userRes.json();
        setUser(userData);
        setSelectedCompany(userData.companyId);

        const [companyData, periodData] = await Promise.all([
          fetch("/api/companies").then((res) => res.json()),
          // Beri tahu TypeScript bahwa hasil json() adalah Promise<AvailablePeriod[]>
          fetch("/api/filters/available-periods").then(
            (res) => res.json() as Promise<AvailablePeriod[]>
          ),
        ]);
        setCompanies(companyData);
        setAvailablePeriods(periodData);

        if (periodData && periodData.length > 0) {
          const latestYear = Math.max(...periodData.map((p) => p.year));
          const periodsInLatestYear = periodData.filter(
            (p) => p.year === latestYear
          );
          const latestMonth = Math.max(
            ...periodsInLatestYear.map((p) => p.month)
          );
          setPeriod((prev) => ({
            ...prev,
            year: latestYear,
            value: latestMonth,
          }));
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        setUser(null);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, [router]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      setUser(null);
      setSelectedCompany(null);
      setCompanies([]);
      setAvailablePeriods([]);
      window.location.href = "/login";
    }
  };

  // --- PERUBAHAN UTAMA ---
  const handleSetSelectedCompany = (companyId: number) => {
    // Hanya izinkan perubahan jika user adalah ADMIN_HOLDING
    if (user?.role === "ADMIN_HOLDING") {
      setSelectedCompany(companyId);
    }
  };

  const value = {
    companies,
    availablePeriods,
    selectedCompany,
    setSelectedCompany: handleSetSelectedCompany, // <-- Gunakan fungsi handler yang baru
    period,
    setPeriod,
    loading,
    user,
    logout,
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
