"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { TurnoverData } from "@/types";

interface TurnOverChartProps {
  data: TurnoverData | null;
  isLoading: boolean;
}

const TurnOverChart: React.FC<TurnOverChartProps> = ({ data, isLoading }) => {
  const option = {
    tooltip: {
      trigger: "axis", // Tampilkan tooltip saat hover di sepanjang sumbu
      axisPointer: {
        type: "cross", // Tampilkan garis silang untuk mempermudah pembacaan
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "20%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data?.chartData.categories || [],
      axisLabel: {
        color: "#A0AEC0",
      },
    },
    yAxis: {
      type: "value",
      splitNumber: 3,
      axisLabel: {
        color: "#A0AEC0",
      },
    },
    series: [
      {
        name: "Resignations",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 8,
        data: data?.chartData.data || [],
        areaStyle: {
          color: "rgba(220, 38, 38, 0.1)",
        },
        itemStyle: {
          color: "#DC2626",
        },
        lineStyle: {
          color: "#DC2626",
          width: 2,
        },
        label: {
          show: true,
          position: "top",
          color: "#FFFFFF",
          fontWeight: "normal",
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        No Data.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-full flex">
      {/* Kolom Kiri: KPI */}
      <div className="w-1/4 flex flex-col justify-center items-center pr-4 border-r border-gray-600">
        <p className="text-gray-400 text-sm">Turn Over Ratio</p>
        {/* Gunakan 'monthlyRatio' dan tambahkan null check untuk keamanan */}
        <p className="text-5xl font-bold my-1">{data?.ytdRatio ?? 0}%</p>
        <p className="text-sm text-red-400">{data?.change}</p>
      </div>

      {/* Kolom Kanan: Chart */}
      <div className="w-3/4 pl-4">
        <ReactECharts
          option={option}
          style={{ height: "100%", minHeight: "200px" }}
        />
      </div>
    </div>
  );
};

export default TurnOverChart;
