// components/charts/HcmaBarChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { CogIcon } from "@heroicons/react/24/outline";

// Menggunakan tipe data yang sama dengan Radar Chart agar mudah diganti
interface ChartData {
  categories: string[];
  data: number[];
}

interface BarChartProps {
  title: string;
  subtitle: string;
  chartData: ChartData | null;
  isLoading: boolean;
  containerClassName?: string;
}

const HcmaBarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  chartData,
  isLoading,
  containerClassName = "bg-white",
}) => {
  // Balik urutan data agar item pertama tampil di paling atas chart
  const reversedCategories = chartData
    ? [...chartData.categories].reverse()
    : [];
  const reversedData = chartData ? [...chartData.data].reverse() : [];

  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    // Konfigurasi Grid sangat penting untuk bar chart horizontal
    grid: {
      left: "3%",
      right: "10%", // Beri ruang untuk label angka
      bottom: "3%",
      top: "3%",
      containLabel: true, // Otomatis menyesuaikan agar label tidak terpotong
    },
    // Sumbu X sekarang menjadi sumbu nilai (angka)
    xAxis: {
      type: "value",
      max: 4,
      // Tampilkan garis ukur vertikal (splitLine)
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#E5E7EB",
        },
      },
      // Tapi sembunyikan elemen sumbu lainnya agar tetap bersih
      axisLabel: { show: false }, // Sembunyikan label (0, 1, 2, 3, 4) di bawah
      axisLine: { show: false }, // Sembunyikan garis sumbu horizontal
      axisTick: { show: false }, // Sembunyikan garis tick kecil
    },
    // Sumbu Y sekarang menjadi sumbu kategori (label)
    yAxis: {
      type: "category",
      data: reversedCategories,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: "Skor",
        type: "bar",
        data: reversedData,
        // Tampilkan label angka di sebelah kanan setiap bar
        label: {
          show: true,
          position: "right",
          formatter: "{c}", // '{c}' akan menampilkan nilai data
          color: "#374151",
        },
        // Styling untuk bar
        itemStyle: {
          color: "#EF4444", // Warna merah yang konsisten
          borderRadius: [0, 5, 5, 0], // Membuat ujung kanan bar melengkung
        },
        barWidth: "60%", // Lebar bar
      },
    ],
  };

  return (
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
      <div style={{ height: "400px", width: "100%" }}>
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
            style={{ height: "100%", width: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default HcmaBarChart;
