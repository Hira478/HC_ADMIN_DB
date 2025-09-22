// File: /components/widgets/TotalHeadcountCard.tsx

"use client";
import { Mars, Venus, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";

interface HeadcountData {
  total: number;
  male: number;
  female: number;
  change?: string;
}

const TotalHeadcountCard = () => {
  const { selectedCompany, period } = useFilters();
  const [data, setData] = useState<HeadcountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany === null || !period) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setData(null);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
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
        const apiData: HeadcountData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error("Fetch error for Headcount:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]);

  const isPositive = data?.change?.startsWith("+");

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white h-full flex flex-col">
      <div>
        <p className="text-gray-400 text-sm">Total Headcount</p>
        <p className="text-4xl font-bold mt-1">
          {loading ? "..." : data?.total.toLocaleString("id-ID") ?? 0}{" "}
          <span className="text-xl font-normal">Employee</span>
        </p>

        {data?.change && (
          <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
            {data.change}
          </p>
        )}
      </div>

      <div className="border-t border-gray-700 my-4"></div>

      <div className="flex justify-between mt-auto">
        {/* --- Bagian Pria --- */}
        <div className="flex flex-col items-center flex-1">
          {/* UBAH: Background ikon menjadi solid dan lebih cerah */}
          <div className="p-3 bg-sky-500 rounded-full mb-2">
            {/* UBAH: Warna ikon menjadi putih untuk kontras maksimal */}
            <Mars className="h-8 w-8 text-white" />
          </div>
          {/* UBAH: Warna angka disesuaikan dengan tema gender */}
          <p className="text-2xl font-bold text-sky-400">
            {loading ? "..." : data?.male.toLocaleString("id-ID") ?? 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Male</p>
        </div>

        {/* --- Bagian Wanita --- */}
        <div className="flex flex-col items-center flex-1">
          {/* UBAH: Background ikon menjadi solid dan lebih cerah */}
          <div className="p-3 bg-pink-500 rounded-full mb-2">
            {/* UBAH: Warna ikon menjadi putih untuk kontras maksimal */}
            <Venus className="h-8 w-8 text-white" />
          </div>
          {/* UBAH: Warna angka disesuaikan dengan tema gender */}
          <p className="text-2xl font-bold text-pink-400">
            {loading ? "..." : data?.female.toLocaleString("id-ID") ?? 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Female</p>
        </div>
      </div>
    </div>
  );
};

export default TotalHeadcountCard;
