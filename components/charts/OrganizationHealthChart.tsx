// components/charts/OrganizationHealthChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";

interface ChartProps {
  data: OrganizationHealthData | null;
  isLoading: boolean;
}

const OrganizationHealthChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    // Hapus tinggi minimum agar container bisa fleksibel
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full flex justify-center items-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!data || data.currentYearData.length === 0) {
    // Hapus tinggi minimum agar container bisa fleksibel
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full flex justify-center items-center">
        <p>Data tidak tersedia untuk filter yang dipilih.</p>
      </div>
    );
  }

  // --- PERUBAHAN UTAMA: HITUNG TINGGI DINAMIS ---
  // Kita tentukan tinggi per bar (misal 45px) + padding atas/bawah (misal 80px)
  const barHeight = 45;
  const padding = 80;
  const chartHeight = data.categories.length * barHeight + padding;

  const options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: [data.previousYear?.toString(), data.currentYear.toString()].filter(
        Boolean
      ),
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "15%", // Beri ruang untuk legenda dan padding
      containLabel: true,
    },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: data.categories,
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: true,
    },
    series: [
      {
        name: data.previousYear?.toString(),
        type: "bar",
        data: data.previousYearData,
        barWidth: "40%",
        label: { show: false }, // Label di dalam bar disembunyikan agar lebih rapi
        itemStyle: { color: "#adb5bd" },
      },
      {
        name: data.currentYear.toString(),
        type: "bar",
        data: data.currentYearData,
        barWidth: "40%",
        label: { show: false }, // Label di dalam bar disembunyikan agar lebih rapi
        itemStyle: { color: "#6c757d" },
      },
    ].filter((series) => series.data && series.data.length > 0),
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-full">
      <h2 className="text-xl font-semibold">Organization Health Index</h2>
      <div className="my-2">
        <span className="text-6xl font-bold text-gray-800">
          {data.currentYearScore.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
        <span className="ml-2 text-lg text-gray-500">Medium</span>
      </div>
      {/* Gunakan tinggi dinamis yang sudah dihitung */}
      <ReactECharts option={options} style={{ height: `${chartHeight}px` }} />
    </div>
  );
};

export default OrganizationHealthChart;
