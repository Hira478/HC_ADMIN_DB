// components/charts/OrganizationHealthChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
// 1. Import tipe data dari API
import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";

// 2. Definisikan interface untuk props
interface ChartProps {
  data: OrganizationHealthData | null;
  isLoading: boolean;
}

// 3. Terima props 'data' dan 'isLoading'
const OrganizationHealthChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  // 4. Tampilkan pesan saat loading
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full flex justify-center items-center min-h-[500px]">
        <p>Memuat data...</p>
      </div>
    );
  }

  // 5. Tampilkan pesan jika data tidak ada
  if (!data || data.currentYearData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full flex justify-center items-center min-h-[500px]">
        <p>Data tidak tersedia untuk filter yang dipilih.</p>
      </div>
    );
  }

  const options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      // Gunakan data dinamis untuk legend
      data: [data.previousYear?.toString(), data.currentYear.toString()].filter(
        Boolean
      ),
      bottom: 10,
    },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      // Gunakan data dinamis untuk kategori
      data: data.categories,
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: true,
    },
    series: [
      {
        name: data.previousYear?.toString(),
        type: "bar",
        // Gunakan data dinamis untuk series
        data: data.previousYearData,
        barWidth: "30%",
        label: {
          show: true,
          position: "right",
          color: "#fff",
          formatter: "{c}",
        },
        itemStyle: { color: "#adb5bd" },
      },
      {
        name: data.currentYear.toString(),
        type: "bar",
        // Gunakan data dinamis untuk series
        data: data.currentYearData,
        barWidth: "30%",
        label: {
          show: true,
          position: "right",
          color: "#fff",
          formatter: "{c}",
        },
        itemStyle: { color: "#6c757d" },
      },
    ].filter((series) => series.data && series.data.length > 0),
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-full">
      <h2 className="text-xl font-semibold">Organization Health Index</h2>
      <div className="my-2">
        <span className="text-6xl font-bold text-gray-800">
          {/* Gunakan skor dinamis */}
          {data.currentYearScore.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
        <span className="ml-2 text-lg text-gray-500">Medium</span>
      </div>
      <ReactECharts option={options} style={{ height: "500px" }} />
    </div>
  );
};

export default OrganizationHealthChart;
