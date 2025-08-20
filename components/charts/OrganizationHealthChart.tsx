// components/charts/OrganizationHealthChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

// Kembalikan ke komponen sederhana tanpa props dinamis
const OrganizationHealthChart = () => {
  // Data dummy dikembalikan ke dalam komponen
  const categories = [
    "Leadership",
    "Human Capital IT",
    "Behaviour & Culture",
    "Capacity & Strategy",
    "Performance & Goal",
    "Learning & Development",
    "Reward & Recognition",
    "Talent & Sucession",
  ];
  const data2023 = [2.38, 2.28, 2.45, 2.51, 2.65, 2.53, 2.53, 2.42];
  const data2024 = [3.0, 2.4, 2.45, 2.6, 3.0, 2.9, 2.76, 2.87];

  const options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: ["2023", "2024"], // Menggunakan tahun statis
      bottom: 10,
    },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: true,
    },
    series: [
      {
        name: "2023",
        type: "bar",
        data: data2023,
        barWidth: "30%",
        label: {
          show: true,
          position: "right",
          color: "#fff",
          formatter: "{c}",
        },
        itemStyle: { color: "#adb5bd" },
      },
      {
        name: "2024",
        type: "bar",
        data: data2024,
        barWidth: "30%",
        label: {
          show: true,
          position: "right",
          color: "#fff",
          formatter: "{c}",
        },
        itemStyle: { color: "#6c757d" },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-full">
      <h2 className="text-xl font-semibold">Organization Health Index</h2>
      <div className="my-2">
        {/* Skor dikembalikan menjadi statis */}
        <span className="text-6xl font-bold text-gray-800">2,3</span>
        <span className="ml-2 text-lg text-gray-500">Medium</span>
      </div>
      <ReactECharts option={options} style={{ height: "450px" }} />
    </div>
  );
};

export default OrganizationHealthChart;
