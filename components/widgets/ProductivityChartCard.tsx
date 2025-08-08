"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Definisikan tipe yang lebih akurat untuk parameter tooltip ECharts
interface EChartsTooltipParams {
  seriesName: string;
  value: number;
  axisValueLabel: string;
  marker: string; // Ikon warna di tooltip
}

// Define a specific type for the chart data
interface ProductivityChartData {
  months: string[];
  revenue: number[];
  netProfit: number[];
}

const ProductivityChartCard = () => {
  const { selectedCompany, period } = useFilters();
  // Use the specific type for state instead of 'any'
  const [chartData, setChartData] = useState<ProductivityChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) {
      setLoading(false);
      return;
    }
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
          `/api/charts/productivity?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: ProductivityChartData = await response.json();
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
    tooltip: {
      trigger: "axis",
      formatter: (params: EChartsTooltipParams[]) => {
        if (!params || params.length === 0) return "";
        let tooltipText = `<strong>${params[0].axisValueLabel}</strong>`;
        params.forEach((item) => {
          tooltipText += `<br/>${item.marker} ${
            item.seriesName
          }: Rp ${item.value.toLocaleString("id-ID")}`;
        });
        return tooltipText;
      },
    },
    legend: {
      data: ["Revenue", "Net Profit"],
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.months || [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6) return `${value / 1e6} Jt`;
          if (value >= 1e3) return `${value / 1e3} Ribu`;
          return value;
        },
      },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        stack: "Total",
        areaStyle: {},
        smooth: true,
        data: chartData?.revenue || [],
        color: "#3B82F6",
      },
      {
        name: "Net Profit",
        type: "line",
        stack: "Total",
        areaStyle: {},
        smooth: true,
        data: chartData?.netProfit || [],
        color: "#10B981",
      },
    ],
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
      <div className="h-24">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-lg text-gray-800">Productivity</h3>
          </div>
          <button className="text-gray-500 hover:text-gray-800">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-grow min-h-0">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
