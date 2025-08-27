"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

interface ChartSeries {
  name: string;
  data: number[];
}

interface EmployeeCostChartData {
  labels: string[];
  series: ChartSeries[];
}

const getColorByIndex = (index: number) => {
  const colors = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#4F46E5"];
  return colors[index % colors.length];
};

const EmployeeCostChartCard = () => {
  const { selectedCompany, period } = useFilters();
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
        type: "yearly",
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
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
      },
    },
    legend: {
      data: chartData?.series.map((s) => s.name) || [],
      top: "bottom",
      itemWidth: 15,
      itemHeight: 10,
    },
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false, // lebih cocok untuk line chart
      data: chartData?.labels || [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6) return value / 1e6 + "M";
          if (value >= 1e3) return value / 1e3 + "K";
          return value;
        },
      },
    },
    series:
      chartData?.series.map((s, idx) => ({
        name: s.name,
        type: "line",
        data: s.data,
        smooth: true, // opsional: membuat garis lebih halus
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: getColorByIndex(idx),
        },
        emphasis: {
          focus: "series",
        },
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
