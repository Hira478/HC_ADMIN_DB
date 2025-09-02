"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";

interface ChartProps {
  data: OrganizationHealthData | null;
  isLoading: boolean;
}

const OrganizationHealthChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  // Opsi chart dipindahkan ke atas agar bisa diakses nanti
  const options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: [
        data?.previousYear?.toString(),
        data?.currentYear.toString(),
      ].filter(Boolean),
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: data?.categories || [],
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: true,
    },
    series: [
      {
        name: data?.previousYear?.toString(),
        type: "bar",
        data: data?.previousYearData,
        barWidth: "40%",
        label: {
          show: true,
          position: "insideRight",
          color: "#fff",
          fontWeight: "bold",
          formatter: "{c}",
        },
        itemStyle: { color: "#adb5bd" },
      },
      {
        name: data?.currentYear.toString(),
        type: "bar",
        data: data?.currentYearData,
        barWidth: "40%",
        label: {
          show: true,
          position: "insideRight",
          color: "#fff",
          fontWeight: "bold",
          formatter: "{c}",
        },
        itemStyle: { color: "#6c757d" },
      },
    ].filter((series) => series.data && series.data.length > 0),
  };

  // Hitung tinggi chart jika data ada
  const chartHeight = data ? data.categories.length * 45 + 80 : 400;

  // --- 1. Struktur utama kartu sekarang ada di luar kondisi ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-full flex flex-col">
      <h2 className="text-xl font-semibold">Organization Health Index</h2>

      {/* Tampilkan skor hanya jika tidak loading dan data ada */}
      {!isLoading && data && data.currentYearData.length > 0 && (
        <div className="my-2">
          <span className="text-3xl font-bold text-gray-800">
            {data.currentYearScore.toLocaleString("id-ID", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
          <span className="ml-2 text-lg text-gray-500">Medium</span>
        </div>
      )}

      {/* --- 2. Area konten dengan tinggi yang pasti --- */}
      {/* min-h-[300px] memastikan area ini tidak kolaps */}
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        {/* --- 3. Logika kondisional sekarang ada di DALAM area konten --- */}
        {isLoading ? (
          <p>Memuat data...</p>
        ) : !data || data.currentYearData.length === 0 ? (
          <p className="text-gray-500">Data Belum Ada</p>
        ) : (
          <ReactECharts
            option={options}
            style={{ height: `${chartHeight}px`, width: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationHealthChart;
