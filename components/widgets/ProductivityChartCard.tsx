// File: components/widgets/ProductivityChartCard.tsx

"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Interface untuk data chart
interface ProductivityChartData {
  months: string[];
  revenue: number[];
  netProfit: number[];
  revenuePerEmployee: number[];
  netProfitPerEmployee: number[];
}

const ProductivityChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ProductivityChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Logika fetch data tetap sama
  useEffect(() => {
    if (!selectedCompany || !period) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
      });
      try {
        const response = await fetch(
          `/api/charts/productivity?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: ProductivityChartData = await response.json();
        setChartData(data);
      } catch (_error) {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: {
      data: [
        "Revenue",
        "Net Profit",
        "Revenue/Employee",
        "Net Profit/Employee",
      ],
      bottom: 10,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.months || [],
    },
    // --- PERUBAHAN UTAMA ADA DI SINI ---
    yAxis: {
      // <-- Diubah dari array [ {..}, {..} ] menjadi satu objek saja
      type: "value",

      name: "Unit: Million Rupiah", // <-- Nama diubah menjadi lebih generik
      position: "left",
      interval: 400000, // Atur interval menjadi 400K (400,000)
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6 || value <= -1e6) return `${value / 1e6}M`;
          if (value >= 1e3 || value <= -1e3) return `${value / 1e3}K`;
          return value;
        },
      },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: false,
        data: chartData?.revenue || [],
        color: "#3B82F6",
        areaStyle: { opacity: 0.3 },
        // yAxisIndex: 0 tidak perlu ditulis karena default
      },
      {
        name: "Net Profit",
        type: "line",
        smooth: false,
        data: chartData?.netProfit || [],
        color: "#84CC16",
        areaStyle: { opacity: 0.3 },
      },
      {
        name: "Revenue/Employee",
        type: "line",
        smooth: false,
        // yAxisIndex: 1, // <-- Dihapus, akan otomatis menggunakan sumbu Y pertama
        data: chartData?.revenuePerEmployee || [],
        color: "#F97316",
        areaStyle: { opacity: 0.3 },
      },
      {
        name: "Net Profit/Employee",
        type: "line",
        smooth: false,
        // yAxisIndex: 1, // <-- Dihapus, akan otomatis menggunakan sumbu Y pertama
        data: chartData?.netProfitPerEmployee || [],
        color: "#EF4444",
        areaStyle: { opacity: 0.3 },
      },
    ],
    // --- AKHIR DARI PERUBAHAN ---
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
  };

  // Logika rendering JSX tetap sama
  if (loading) return <CardLoader />;
  if (!chartData)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        Data tidak tersedia.
      </div>
    );
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-lg text-gray-800">Productivity</h3>
          <p className="text-sm text-gray-500">{period.year}</p>
        </div>
        <button className="text-gray-500 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
