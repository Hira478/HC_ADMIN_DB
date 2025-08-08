// components/widgets/ProductivityChartCard.tsx
"use client";

import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";

// Definisikan tipe untuk parameter formatter tooltip ECharts
interface EChartsTooltipParams {
  seriesName: string;
  value: number;
  axisValueLabel: string; // <-- PERBAIKAN: Properti untuk label sumbu X (nama bulan)
  marker: string; // <-- PERBAIKAN: Properti untuk ikon warna di tooltip
}

const ProductivityChartCard = () => {
  // Data untuk chart. Ini bisa diganti dengan data dari props nanti.
  const chartData = {
    months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni"],
    revenue: [55000000, 30000000, 45000000, 60000000, 50000000, 75000000],
    netProfit: [35000000, 20000000, 30000000, 40000000, 35000000, 50000000],
  };

  const option = {
    tooltip: {
      trigger: "axis",
      // Menggunakan formatter untuk menampilkan format Rupiah di tooltip
      formatter: (params: EChartsTooltipParams[]) => {
        // params[0] akan selalu ada jika tooltip ter-trigger di area chart
        if (!params || params.length === 0) {
          return "";
        }

        let tooltipText = params[0].axisValueLabel; // Sekarang tidak error
        params.forEach((item) => {
          tooltipText += `<br/>${item.marker} ${
            // Sekarang tidak error
            item.seriesName
          }: Rp ${item.value.toLocaleString("id-ID")}`;
        });
        return tooltipText;
      },
    },
    legend: {
      data: ["Revenue", "Net Profit"],
      bottom: 10,
      itemGap: 20,
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
      data: chartData.months,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `Rp ${value / 1000000} Jt`;
          }
          return `Rp ${value}`;
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
        data: chartData.revenue,
        color: "#3B82F6",
      },
      {
        name: "Net Profit",
        type: "line",
        stack: "Total",
        areaStyle: {},
        smooth: true,
        data: chartData.netProfit,
        color: "#10B981",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="pb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Productivity</h3>
          <button className="text-gray-500 hover:text-gray-800">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-grow min-h-0">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
