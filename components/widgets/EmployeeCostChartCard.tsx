"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Define specific types for the chart data to avoid 'any'
interface ChartSeries {
  name: string;
  data: number[];
}

interface EmployeeCostChartData {
  labels: string[];
  series: ChartSeries[];
}

const EmployeeCostChartCard = () => {
  const { selectedCompany, period } = useFilters();
  // Use the specific type for state
  const [chartData, setChartData] = useState<EmployeeCostChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) return;
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        type: "yearly", // <-- PAKSA TIPE MENJADI 'yearly'
        year: String(period.year),
        value: "1",
      });
      try {
        const response = await fetch(
          `/api/charts/employee-cost?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: EmployeeCostChartData = await response.json();
        setChartData(data);
      } catch (_error) {
        // Fix: unused variable warning
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      // No 'any' needed here due to typed state
      data: chartData?.series.map((s) => s.name) || [],
      top: "top",
      itemWidth: 15,
      itemHeight: 10,
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.labels || [],
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6) return value / 1e6 + "M";
          if (value >= 1e3) return value / 1e3 + "K";
          return value;
        },
      },
    },
    series:
      // No 'any' needed here due to typed state
      chartData?.series.map((s) => ({
        ...s,
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
      })) || [],
  };

  if (loading) return <CardLoader />;
  if (!chartData)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        Data tidak tersedia untuk periode ini.
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            Employee Cost Breakdown
          </h3>
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

export default EmployeeCostChartCard;
