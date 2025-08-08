"use client";

import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";

// Definisikan tipe untuk parameter formatter tooltip ECharts
interface EChartsTooltipParams {
  seriesName: string;
  value: number;
  // Anda bisa tambahkan properti lain jika dibutuhkan
}

const ProductivityChartCard = () => {
  // Data dummy, bisa diganti dengan fetch data nanti
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],
    revenue: [55, 30, 45, 60, 50],
    netProfit: [35, 20, 30, 40, 35],
  };

  const option = {
    tooltip: {
      trigger: "axis",
      // Perbaikan di sini: ganti 'any' dengan tipe yang sudah didefinisikan
      formatter: (params: EChartsTooltipParams[]) => {
        return params
          .map(
            (
              item: EChartsTooltipParams // <-- Terapkan tipe di sini juga
            ) => `${item.seriesName}: Rp. ${item.value.toLocaleString("id-ID")}`
          )
          .join("<br/>");
      },
    },
    legend: { data: ["Revenue", "Net Profit"], bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: chartData.months },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `Rp. ${value.toLocaleString("id-ID")}`,
      },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        stack: "Total",
        areaStyle: {},
        data: chartData.revenue,
      },
      {
        name: "Net Profit",
        type: "line",
        stack: "Total",
        areaStyle: {},
        data: chartData.netProfit,
      },
    ],
  };

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
        {/* Kode sebelumnya memiliki tinggi tetap, sebaiknya diubah menjadi 100% */}
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
