// components/charts/GroupedBarChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
// Sesuaikan path jika berbeda
import { CultureMaturityData as GroupedChartData } from "@/app/api/charts/culture-maturity/route";

// PERUBAHAN 1: Interface disederhanakan, hanya terima data dan isLoading
interface GroupedBarChartProps {
  data: GroupedChartData | null;
  isLoading: boolean;
  cardClassName?: string;
  showSummary?: boolean;
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  isLoading,
  cardClassName = "bg-white text-gray-800",
  showSummary = true,
}) => {
  if (isLoading || !data) {
    const message = isLoading ? "Memuat data..." : "Data tidak tersedia.";
    const height = cardClassName.includes("bg-[#343A40]") ? "410px" : "auto"; // Atur tinggi agar konsisten
    return (
      <div
        className={`p-6 rounded-lg shadow-md w-full flex justify-center items-center ${cardClassName}`}
        style={{ height }}
      >
        <p>{message}</p>
      </div>
    );
  }

  // PERUBAHAN 2: Semua informasi diambil dari prop 'data'
  const { title, mainScore, scoreLabel, trend, chartData, prevYear, currYear } =
    data;

  const options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: [prevYear?.toString(), currYear.toString()].filter(Boolean),
      top: 10,
      textStyle: {
        color: cardClassName.includes("bg-[#343A40]") ? "#fff" : "#333",
      },
    },
    grid: {
      left: "0%", // Kurangi jarak kiri untuk mengisi ruang kosong
      right: "4%",
      bottom: "15%", // Tambah jarak bawah untuk label yang diputar
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: cardClassName.includes("bg-[#343A40]") ? "#ccc" : "#666",
        interval: 0, // Paksa semua label untuk tampil
        rotate: 30, // Putar label 30 derajat
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: cardClassName.includes("bg-[#343A40]") ? "#555" : "#E5E7EB",
        },
      },
      axisLabel: {
        color: cardClassName.includes("bg-[#343A40]") ? "#ccc" : "#666",
      },
    },
    series: [
      {
        name: prevYear?.toString(),
        type: "bar",
        data: chartData.seriesPrevYear,
        barWidth: "30%",
        label: {
          show: true,
          position: "top",
          color: cardClassName.includes("bg-[#343A40]") ? "#fff" : "#333",
        },
        itemStyle: { color: "#f87171" },
      },
      {
        name: currYear.toString(),
        type: "bar",
        data: chartData.seriesCurrYear,
        barWidth: "30%",
        label: {
          show: true,
          position: "top",
          color: cardClassName.includes("bg-[#343A40]") ? "#fff" : "#333",
        },
        itemStyle: { color: "#facc15" },
      },
    ].filter((s) => s.data && s.data.length > 0),
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md w-full h-full flex flex-col ${cardClassName}`}
    >
      {/* 3. Gunakan conditional rendering di sini */}
      {showSummary ? (
        // Tampilan LAMA: dengan teks ringkasan di kiri
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-1/4 text-center md:text-left md:pl-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="my-2">
              <span className="text-3xl font-bold">{mainScore}</span>
              <p className="text-base">{scoreLabel}</p>
              <p className="text-sm text-green-500">{trend}</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ReactECharts
              option={options}
              style={{ height: "100%", minHeight: "250px" }}
            />
          </div>
        </div>
      ) : (
        // Tampilan BARU: hanya chart saja
        <ReactECharts
          option={options}
          style={{ height: "100%", minHeight: "250px" }}
        />
      )}
    </div>
  );
};

export default GroupedBarChart;
