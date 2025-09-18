// components/charts/GroupedBarChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
// Sesuaikan path jika berbeda
import type { GroupedChartData } from "@/types";
import InfoTooltip from "@/components/ui/InfoTooltip";

// PERUBAHAN 1: Interface disederhanakan, hanya terima data dan isLoading
interface GroupedBarChartProps {
  data: GroupedChartData | null;
  isLoading: boolean;
  cardClassName?: string;
  showSummary?: boolean;
  yAxisMax?: number;
  tooltipText?: string;
  summaryUnit?: string;
  layoutMode?: "default" | "wide";
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  isLoading,
  cardClassName = "bg-white text-gray-800",
  showSummary = true,
  yAxisMax,
  tooltipText,
  summaryUnit,
  layoutMode = "default",
}) => {
  if (isLoading || !data || !data.chartData) {
    const message = isLoading ? "Loading data..." : "No Data.";

    return (
      <div
        // 1. TAMBAHKAN h-full agar card ini mengisi tinggi sel grid
        // 2. HAPUS 'style' prop seluruhnya (kita tidak perlu lagi minHeight 250px)
        className={`p-6 rounded-lg shadow-md w-full flex justify-center items-center ${cardClassName} h-full`}
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
      bottom: "1%", // Tambah jarak bawah untuk label yang diputar
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
        // rotate: 30, // <-- Dihapus, tidak perlu lagi dimiringkan
        // 2. Tambahkan formatter untuk memecah teks menjadi 2 baris
        formatter: function (value: string) {
          // 1. Membersihkan spasi di awal/akhir dan memecah menjadi kata-kata
          const words = value.trim().split(/\s+/);

          // 2. Logika untuk label panjang (3+ kata)
          if (words.length >= 3) {
            const firstLine = words.slice(0, 2).join(" ");
            const secondLine = words.slice(2).join(" ");
            return `${firstLine}\n${secondLine}`;
          }

          // 3. Logika untuk label 1 atau 2 kata (lebih aman)
          return words.join("\n");
        },
      },
    },
    yAxis: {
      type: "value",
      max: yAxisMax,
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
        itemStyle: { color: "rgba(248, 113, 113, 0.7)" },
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
        itemStyle: { color: "rgba(250, 204, 21, 0.7)" },
      },
    ].filter((s) => s.data && s.data.length > 0),
  };

  return (
    <div
      className={`relative p-6 rounded-lg shadow-md w-full h-full flex flex-col ${cardClassName}`}
    >
      {showSummary ? (
        // --- 3. GUNAKAN KONDISI UNTUK MEMILIH LAYOUT ---
        <div
          className={`flex h-full items-center ${
            layoutMode === "wide"
              ? "flex-col md:flex-row gap-4"
              : "flex-col md:flex-row gap-6"
          }`}
        >
          {/* Kolom Ringkasan Kiri */}
          <div
            className={
              layoutMode === "wide"
                ? "w-full md:max-w-xs flex-shrink-0 text-center md:text-left md:pl-4" // Layout 'wide'
                : "md:w-1/4 text-center md:text-left md:pl-4" // Layout 'default'
            }
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold whitespace-pre-line">
                {data.title}
              </h2>
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold">{data.mainScore}</span>
              <p className="text-base">{data.scoreLabel}</p>
              <p className="text-sm text-green-500">{data.trend}</p>
            </div>
          </div>

          {/* Kolom Chart Kanan */}
          <div className="relative flex-1 w-full h-full">
            <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
              {summaryUnit && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {summaryUnit}
                </span>
              )}
              {tooltipText && (
                <InfoTooltip
                  content={tooltipText}
                  position="bottom"
                  align="right"
                />
              )}
            </div>
            <ReactECharts
              option={options}
              style={{ height: "100%", minHeight: "250px" }}
            />
          </div>
        </div>
      ) : (
        // --- BLOK UNTUK TAMPILAN HANYA CHART (Tidak berubah) ---
        <>
          {tooltipText && (
            <div className="absolute top-4 right-4 z-10">
              <InfoTooltip
                content={tooltipText}
                position="bottom"
                align="right"
              />
            </div>
          )}
          <ReactECharts
            option={options}
            style={{ height: "100%", minHeight: "250px" }}
          />
        </>
      )}
    </div>
  );
};

export default GroupedBarChart;
