"use client";
import React from "react";
import ReactECharts from "echarts-for-react";
import { CogIcon } from "@heroicons/react/24/outline";

// Tipe data yang diterima dari API
interface HcmaData {
  chartData: {
    categories: string[];
    data: number[];
  };
  summary: {
    totalScore: number;
    averageScore: number;
    yoy: string;
  };
}

interface BarChartProps {
  title: string;
  subtitle: string;
  data: HcmaData | null;
  isLoading: boolean;
  containerClassName?: string;
}

const HcmaBarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  isLoading,
  containerClassName = "bg-white",
}) => {
  // Ambil data untuk chart vertikal (tidak perlu dibalik)
  const categories = data ? data.chartData.categories : [];
  const scores = data ? data.chartData.data : [];

  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    // Konfigurasi untuk chart vertikal
    xAxis: {
      type: "category",
      data: categories,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        interval: 0,
        rotate: 30, // Miringkan label jika terlalu panjang
      },
    },
    yAxis: {
      type: "value",
      max: 5, // Skor maksimal adalah 5
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#E5E7EB",
        },
      },
    },
    series: [
      {
        name: "Skor",
        type: "bar",
        data: scores,
        label: {
          show: true,
          position: "top", // Label di atas bar
          formatter: "{c}",
          color: "#374151",
        },
        itemStyle: {
          color: "#EF4444",
          borderRadius: [5, 5, 0, 0], // Lengkungan di ujung atas bar
        },
        barWidth: "40%",
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
          <span className="text-sm text-gray-600">Unit: Score</span>
          <CogIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <p>Memuat data...</p>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-[400px]">
          <p>Data tidak tersedia.</p>
        </div>
      ) : (
        // Layout Baru: Skor di Atas, Chart di Bawah
        <div>
          {/* Bagian Skor Rata-rata */}
          <div className="text-center p-4 border-b mb-4">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-5xl font-bold text-gray-800 my-1">
              {data.summary.averageScore}
            </p>
            <p className="text-sm text-gray-400">out of 5.0</p>
          </div>

          {/* Bagian Chart */}
          <div style={{ height: "350px", width: "100%" }}>
            <ReactECharts
              option={options}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HcmaBarChart;
