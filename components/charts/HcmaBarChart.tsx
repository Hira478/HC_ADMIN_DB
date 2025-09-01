"use client";
import React from "react";
import ReactECharts from "echarts-for-react";
import { CogIcon } from "@heroicons/react/24/outline";

// Tipe data baru yang diterima dari API
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
  const reversedCategories = data
    ? [...data.chartData.categories].reverse()
    : [];
  const reversedData = data ? [...data.chartData.data].reverse() : [];

  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "10%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: 4,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#E5E7EB",
        },
      },
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
    },
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
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          color: "#374151",
        },
        itemStyle: {
          color: "#EF4444",
          borderRadius: [0, 5, 5, 0],
        },
        barWidth: "60%",
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
        {/* 1. Tambahkan "Satuan: Skor" di sini */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Satuan: Skor</span>
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
        <div
          className="flex flex-col lg:flex-row gap-6"
          style={{ height: "400px" }}
        >
          {/* Kolom Kiri: Chart */}
          <div className="w-full lg:w-2/3 h-full">
            <ReactECharts
              option={options}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          {/* Kolom Kanan: Summary Skor */}
          {/* 2. Tambahkan 'items-center' untuk menengahkan secara horizontal */}
          <div className="w-full lg:w-1/3 h-full flex flex-col justify-center items-center border-l pl-6">
            <div className="mb-6 text-center">
              {" "}
              {/* 3. Tengahkan teks */}
              <h2 className="text-xl font-semibold">Total Score</h2>
              <p className="text-4xl font-bold text-gray-800">
                {data.summary.totalScore}
              </p>
              <p className="text-sm font-semibold text-green-600">
                {data.summary.yoy}
              </p>
            </div>
            <div className="text-center">
              {" "}
              {/* 3. Tengahkan teks */}
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-4xl font-bold text-gray-800">
                {data.summary.averageScore}
              </p>
              <p className="text-sm text-gray-400">out of 5.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HcmaBarChart;
