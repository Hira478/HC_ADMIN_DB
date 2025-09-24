// File: components/widgets/ProductivityChartCard.tsx

"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Interface untuk data chart (tetap sama)
interface ProductivityChartData {
  months: string[];
  revenue: number[];
  netProfit: number[];
  revenuePerEmployee: number[];
  netProfitPerEmployee: number[];
}

// 1. BUAT SUB-KOMPONEN UNTUK SATU CHART INDIVIDUAL
// Ini akan membantu kita menghindari duplikasi kode
const IndividualChart = ({
  title,
  seriesData,
  months,
  color,
}: {
  title: string;
  seriesData: number[];
  months: string[];
  color: string;
}) => {
  const option = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: months,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
          if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
          return value;
        },
      },
    },
    series: [
      {
        name: title,
        type: "line",
        smooth: false,
        data: seriesData,
        color: color,
        areaStyle: { opacity: 0.3 },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%", // Beri ruang di atas untuk judul
      containLabel: true,
    },
    title: {
      text: title,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
  };

  return (
    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-200 h-80">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

const ProductivityChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ProductivityChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Logika fetch data tidak berubah
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
      } catch {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  if (loading) return <CardLoader />;
  if (!chartData)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        No Data.
      </div>
    );

  // 2. UBAH TAMPILAN UNTUK MERENDER GRID 2x2 DARI CHART INDIVIDUAL
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          Productivity Details {period.year}
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndividualChart
          title="Revenue"
          seriesData={chartData.revenue}
          months={chartData.months}
          color="#3B82F6" // Blue
        />
        <IndividualChart
          title="Net Profit"
          seriesData={chartData.netProfit}
          months={chartData.months}
          color="#84CC16" // Green
        />
        <IndividualChart
          title="Revenue/Employee"
          seriesData={chartData.revenuePerEmployee}
          months={chartData.months}
          color="#F97316" // Orange
        />
        <IndividualChart
          title="Net Profit/Employee"
          seriesData={chartData.netProfitPerEmployee}
          months={chartData.months}
          color="#EF4444" // Red
        />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
