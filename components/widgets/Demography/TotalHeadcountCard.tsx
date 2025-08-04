"use client";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";

interface HeadcountData {
  total: number;
  male: number;
  female: number;
}

const TotalHeadcountCard = () => {
  // Ambil 'period' dari context
  const { selectedCompany, period } = useFilters();
  const [data, setData] = useState<HeadcountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Penjaga: jangan fetch jika filter belum siap
    if (!selectedCompany || !period) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Bangun URL dengan semua parameter filter
        const params = new URLSearchParams({
          companyId: selectedCompany,
          type: period.type,
          year: String(period.year),
          value: String(period.value),
        });

        const response = await fetch(
          `/api/demography/headcount?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error("Fetch error for Headcount:", error);
        setData(null); // Reset ke null jika error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]); // <-- Fetch ulang saat company atau periode berubah

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white h-full">
      <p className="text-gray-400">Total Headcount</p>
      <p className="text-4xl font-bold mt-2">
        {loading ? "..." : data?.total ?? 0}{" "}
        <span className="text-2xl font-normal">Employee</span>
      </p>
      <p className="text-green-500 text-sm mt-1">+10% | Year on Year</p>

      <div className="border-t border-gray-700 my-4"></div>

      <div className="flex justify-around items-center text-center">
        <div className="flex flex-col items-center">
          <User className="h-8 w-8 text-blue-400" />
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : data?.male ?? 0}
          </p>
          <p className="text-xs text-gray-400">Employee</p>
        </div>
        <div className="w-px h-16 bg-gray-700"></div>
        <div className="flex flex-col items-center">
          <User className="h-8 w-8 text-pink-400" />
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : data?.female ?? 0}
          </p>
          <p className="text-xs text-gray-400">Employee</p>
        </div>
      </div>
    </div>
  );
};

export default TotalHeadcountCard;
