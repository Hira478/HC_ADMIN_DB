// File: components/charts/FormationRasioBarChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { FormationRasioTableData } from "@/types"; // Gunakan tipe yang sudah ada

interface ChartProps {
  data: FormationRasioTableData | null;
  isLoading: boolean;
}

// Definisikan kategori untuk pewarnaan dan area
const enablerFamilies = ["IT", "HC & GA", "Finance", "Compliance"];
const revenueFamilies = ["Strategy", "Business", "Operation"];

const FormationRasioBarChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        <p>Loading Chart...</p>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        <p>No data available to display chart.</p>
      </div>
    );
  }

  // Proses data untuk ECharts
  const categories = data.data.map((item) => item.jobFamily);
  const seriesData = data.data.map((item) => ({
    value: parseFloat(item.rasio), // Ambil angka dari string 'x.x%'
    // Atur warna bar berdasarkan kategori
    itemStyle: {
      color: enablerFamilies.includes(item.jobFamily) ? "#3B82F6" : "#16A34A",
    },
  }));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: "{b}<br/>Rasio: {c}%",
    },
    legend: {
      data: ["Enabler", "Revenue Generator"],
      top: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [
      {
        name: "Rasio", // Nama series utama
        type: "bar",
        data: seriesData,
        barWidth: "60%",
        label: {
          show: true,
          position: "top",
          formatter: "{c}%",
          color: "#333",
        },
        // INI BAGIAN KUNCI UNTUK MEMBUAT "VISUAL AREA"
        markArea: {
          silent: true, // Agar tidak bisa di-klik
          itemStyle: {
            color: "rgba(0, 0, 0, 0.05)", // Warna abu-abu transparan
          },
          data: [
            // Area untuk Enabler
            [
              { name: "Enabler", xAxis: enablerFamilies[0] }, // Mulai dari job family pertama
              { xAxis: enablerFamilies[enablerFamilies.length - 1] }, // Selesai di job family terakhir
            ],
            // Area untuk Revenue Generator
            [
              { name: "Revenue Generator", xAxis: revenueFamilies[0] },
              { xAxis: revenueFamilies[revenueFamilies.length - 1] },
            ],
          ],
        },
      },
      // Series dummy untuk legenda
      {
        name: "Enabler",
        type: "bar",
        data: [],
        itemStyle: { color: "#3B82F6" },
      },
      {
        name: "Revenue Generator",
        type: "bar",
        data: [],
        itemStyle: { color: "#16A34A" },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Employee Formation Rasio</h2>
      <div style={{ height: "400px" }}>
        {" "}
        {/* Beri tinggi agar chart terlihat */}
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default FormationRasioBarChart;
