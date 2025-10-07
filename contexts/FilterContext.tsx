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
  role: "ADMIN_HOLDING" | "USER_ANPER" | "SUPER_ADMIN";
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
  statusFilter: "all" | "permanent" | "contract";
  setStatusFilter: React.Dispatch<
    React.SetStateAction<"all" | "permanent" | "contract">
  >;
  loading: boolean;
  user: UserSession | null;
  logout: () => void;
  isSlideshowMode: boolean;
  toggleSlideshowMode: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<AvailablePeriod[]>(
    []
  );
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "permanent" | "contract"
  >("all");
  const [period, setPeriod] = useState<Period>({
    type: "monthly",
    year: new Date().getFullYear(),
    value: new Date().getMonth() + 1,
  });

  const [user, setUser] = useState<UserSession | null>(null);
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);
  const router = useRouter();

  const toggleSlideshowMode = () => {
    setIsSlideshowMode((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSlideshowMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        // 1. Ambil data user
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) throw new Error("Not authenticated.");
        const userData: UserSession = await userRes.json();
        setUser(userData);

        // 2. Ambil daftar perusahaan
        const companyData = await fetch("/api/companies").then((res) =>
          res.json()
        );
        setCompanies(companyData);

        // 3. Tentukan companyId default
        let initialCompanyId: number | null = null;
        if (userData.role === "USER_ANPER") {
          initialCompanyId = userData.companyId;
        } else if (companyData.length > 0) {
          initialCompanyId = companyData[0].id;
        }
        setSelectedCompany(initialCompanyId);

        // Jika tidak ada companyId, hentikan loading
        if (!initialCompanyId) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        router.push("/login");
      }
      // setLoading(false) akan dipindah ke useEffect berikutnya
    };
    initializeDashboard();
  }, [router]);

  // useEffect BARU: bereaksi setiap kali selectedCompany berubah
  useEffect(() => {
    if (!selectedCompany) return;

    const fetchPeriodsAndSetDefault = async () => {
      setLoading(true); // Tampilkan loading saat ganti perusahaan
      try {
        // 4. Ambil periode yang tersedia UNTUK perusahaan yang dipilih
        const periodRes = await fetch(
          `/api/filters/available-periods?companyId=${selectedCompany}`
        );
        const periodData: AvailablePeriod[] = await periodRes.json();
        setAvailablePeriods(periodData);

        // 5. Set periode default ke yang terbaru dari daftar
        if (periodData.length > 0) {
          const latest = periodData[0];
          setPeriod({
            type: "monthly",
            year: latest.year,
            value: latest.month,
          });
        } else {
          // Fallback jika perusahaan ini belum punya data sama sekali
          setPeriod({
            type: "monthly",
            year: new Date().getFullYear(),
            value: new Date().getMonth() + 1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch periods for company:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriodsAndSetDefault();
  }, [selectedCompany]); // <-- "Dengarkan" perubahan pada selectedCompany

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

  const handleSetSelectedCompany = (companyId: number) => {
    if (user?.role === "ADMIN_HOLDING" || user?.role === "SUPER_ADMIN") {
      setSelectedCompany(companyId);
    }
  };

  const value: FilterContextType = {
    companies,
    availablePeriods,
    selectedCompany,
    setSelectedCompany: handleSetSelectedCompany,
    period,
    setPeriod,
    statusFilter,
    setStatusFilter,
    loading,
    user,
    logout,
    isSlideshowMode,
    toggleSlideshowMode,
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
