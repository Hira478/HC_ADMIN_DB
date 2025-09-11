"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation"; // <-- 1. Import useRouter

// --- Tipe Data Baru untuk Sesi User ---
interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string; // Misal: "ADMIN_HOLDING" atau "USER_ANPER"
  companyId: number;
  companyName: string;
}

export interface Period {
  type: "monthly" | "quarterly" | "semesterly" | "yearly";
  year: number;
  value: number;
}

interface Company {
  id: number;
  name: string;
}

interface FilterContextType {
  companies: Company[];
  availablePeriods: { year: number; month: number }[];
  selectedCompany: number | null;
  setSelectedCompany: (companyId: number) => void; // Kita biarkan tipenya, tapi fungsinya tetap dikunci
  period: Period;
  setPeriod: (period: Period) => void;
  loading: boolean;
  user: UserSession | null; // <-- 2. Tambahkan User ke Tipe Konteks
  logout: () => void; // <-- 3. Tambahkan fungsi Logout ke Tipe Konteks
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<
    { year: number; month: number }[]
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>({
    type: "monthly",
    year: new Date().getFullYear(), // Gunakan tahun saat ini sebagai default awal
    value: new Date().getMonth() + 1, // Gunakan bulan saat ini sebagai default awal
  });

  // --- State Baru untuk Auth ---
  const [user, setUser] = useState<UserSession | null>(null);
  const router = useRouter(); // Hook untuk redirect

  // --- 4. Modifikasi Total useEffect Utama ---
  // Kita ubah logikanya: Fetch User DULU, baru fetch data filter.
  useEffect(() => {
    setLoading(true);

    const initializeDashboard = async () => {
      try {
        // 1. Ambil data user dari endpoint /me yang baru Anda buat
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          // Jika gagal (token tidak ada/invalid), lempar error untuk pindah ke catch
          throw new Error("Not authenticated. Redirecting to login.");
        }

        const userData: UserSession = await userRes.json();
        setUser(userData);

        // 2. GUNAKAN companyId dari USER untuk menggantikan hardcode '7'
        setSelectedCompany(userData.companyId);

        // 3. Setelah user divalidasi, ambil data filter (Companies & Periods)
        const [companyData, periodData] = await Promise.all([
          fetch("/api/companies").then((res) => res.json()),
          fetch("/api/filters/available-periods").then((res) => res.json()),
        ]);

        setCompanies(companyData);
        setAvailablePeriods(periodData);

        // 4. Logic cerdas Anda untuk set periode default (ini sudah benar)
        if (periodData && periodData.length > 0) {
          const latestYear = Math.max(
            ...periodData.map((p: { year: number }) => p.year)
          );
          const periodsInLatestYear = periodData.filter(
            (p: { year: number }) => p.year === latestYear
          );
          const latestMonth = Math.max(
            ...periodsInLatestYear.map((p: { month: number }) => p.month)
          );
          setPeriod((prev) => ({
            ...prev,
            year: latestYear,
            value: latestMonth,
          }));
        }
      } catch (error) {
        // 5. Jika ada error APAPUN (termasuk user tidak login), redirect ke login
        console.error("Initialization Error:", error);
        setUser(null);
        router.push("/login"); // Paksa kembali ke login
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]); // Tambahkan router sebagai dependensi

  // --- 5. Buat Fungsi Logout ---
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      // Bersihkan semua state dan paksa redirect ke login
      setUser(null);
      setSelectedCompany(null);
      setCompanies([]);
      setAvailablePeriods([]);

      // Ganti router.push dengan hard refresh ke halaman login
      window.location.href = "/login";
    }
  };

  // --- 6. Update Value Provider ---
  const value = {
    companies,
    availablePeriods,
    selectedCompany,
    setSelectedCompany: () => {}, // Tetap kunci fungsi ini (karena companyId dari token)
    period,
    setPeriod,
    loading,
    user, // <-- Tambahkan user
    logout, // <-- Tambahkan logout
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
