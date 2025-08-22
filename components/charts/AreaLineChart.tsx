// components/charts/AreaLineChart.tsx

"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { CogIcon } from "@heroicons/react/24/outline";

interface ChartData {
  categories: string[];
  data: number[];
}

interface AreaLineChartProps {
  title: string;
  subtitle: string;
  chartData: ChartData | null; // Izinkan data menjadi null
  isLoading: boolean; // Tambahkan prop isLoading
  containerClassName?: string;
}

const AreaLineChart: React.FC<AreaLineChartProps> = ({
  title,
  subtitle,
  chartData,
  isLoading, // Ambil prop isLoading
  containerClassName = "bg-white",
}) => {
  const options = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => value + " %",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.categories || [],
      // 1. Tambahkan garis penanda kecil di bawah label
      axisTick: {
        show: true,
        alignWithLabel: true,
      },

      // 2. Tampilkan semua label (interval: 0) dan putar 30 derajat
      axisLabel: {
        interval: 0,
        rotate: 30,
      },

      // 3. Tampilkan garis vertikal putus-putus di area chart
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#E5E7EB",
        },
      },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: "#E5E7EB" } },
      interval: 10, // Menjaga interval agar tidak bertumpuk
      min: 0,
      max: 100,
    },
    series: [
      {
        name: "Rasio",
        type: "line",
        smooth: true,
        data: chartData?.data || [], // Gunakan data dari props
        showSymbol: true,
        symbolSize: 8,
        label: {
          show: true,
          position: "top",
          color: "#374151",
          fontWeight: "bold",
          // Tambahkan ini untuk format label di atas titik data
          formatter: "{c}%",
        },
        lineStyle: { color: "#EF4444", width: 3 },
        itemStyle: { color: "#EF4444", borderColor: "#FFFFFF", borderWidth: 2 },
        areaStyle: {
          color: "rgba(239, 68, 68, 0.15)",
        },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
  };

  return (
    // Mengembalikan struktur div yang lebih sederhana
    <div className={`p-6 rounded-lg shadow-md w-full ${containerClassName}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Satuan: %</span>
          <CogIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        </div>
      </div>
      {/* Memberikan tinggi yang pasti dan tetap langsung ke chart */}
      <div className="flex-1 w-full min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Memuat data...</p>
          </div>
        ) : !chartData || chartData.data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p>Data tidak tersedia.</p>
          </div>
        ) : (
          <ReactECharts
            option={options}
            style={{ height: "400px", width: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default AreaLineChart;
