// File: components/widgets/ProductivityChartCard.tsx

"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

interface EChartsTooltipParams {
  seriesName: string;
  value: number;
  axisValueLabel: string;
  marker: string;
}

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

  // Konfigurasi ECharts dengan satu Sumbu Y
  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params: EChartsTooltipParams[]) => {
        if (!params || params.length === 0) return "";
        let tooltipText = `<strong>${params[0].axisValueLabel}</strong>`;
        params.forEach((item) => {
          const formattedValue = item.value.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });
          tooltipText += `<br/>${item.marker} ${item.seriesName}: Rp ${formattedValue}`;
        });
        return tooltipText;
      },
    },
    legend: {
      data: [
        "Revenue",
        "Net Profit",
        "Revenue/Employee",
        "Net Profit/Employee",
      ],
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "10%",
      bottom: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.months || [],
    },
    // 1. Sumbu Y diubah kembali menjadi satu objek (bukan array)
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6 || value <= -1e6) return `${value / 1e6}M`;
          if (value >= 1e3 || value <= -1e3) return `${value / 1e3}K`;
          return value;
        },
      },
    },
    // 2. Properti `yAxisIndex` dihapus dari semua seri
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        data: chartData?.revenue || [],
        color: "#3B82F6",
      },
      {
        name: "Net Profit",
        type: "line",
        smooth: true,
        data: chartData?.netProfit || [],
        color: "#10B981",
      },
      {
        name: "Revenue/Employee",
        type: "line",
        smooth: true,
        data: chartData?.revenuePerEmployee || [],
        color: "#F97316",
      },
      {
        name: "Net Profit/Employee",
        type: "line",
        smooth: true,
        data: chartData?.netProfitPerEmployee || [],
        color: "#EF4444",
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
