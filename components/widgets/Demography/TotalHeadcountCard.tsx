"use client";
import { Mars, Venus } from "lucide-react";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";

interface HeadcountData {
  total: number;
  male: number;
  female: number;
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
        const apiData = await response.json();
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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white h-full flex flex-col">
      <div>
        <p className="text-gray-400 text-sm">Total Headcount</p>
        <p className="text-4xl font-bold mt-1">
          {loading ? "..." : data?.total ?? 0}{" "}
          <span className="text-xl font-normal">Employee</span>
        </p>
        <p className="text-green-500 text-sm mt-1">+10% | Year on Year</p>
      </div>

      <div className="border-t border-gray-700 my-4"></div>

      <div className="flex justify-between mt-auto">
        <div className="flex flex-col items-center flex-1">
          <div className="p-3 bg-blue-900/30 rounded-full mb-2">
            <Mars className="h-8 w-8 text-blue-400" /> {/* Perbesar ikon */}
          </div>
          <p className="text-2xl font-bold">
            {loading ? "..." : data?.male ?? 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Male</p>{" "}
          {/* Perbesar teks */}
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="p-3 bg-pink-900/30 rounded-full mb-2">
            <Venus className="h-8 w-8 text-pink-400" /> {/* Perbesar ikon */}
          </div>
          <p className="text-2xl font-bold">
            {loading ? "..." : data?.female ?? 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Female</p>{" "}
          {/* Perbesar teks */}
        </div>
      </div>
    </div>
  );
};

export default TotalHeadcountCard;
