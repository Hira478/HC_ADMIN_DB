// File: components/charts/FormationRasioBarChart.tsx
"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { FormationRasioTableData } from "@/types";

interface ChartProps {
  data: FormationRasioTableData | null;
  isLoading: boolean;
}

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

  const categories = data.data.map((item) => item.jobFamily);
  const numericValues = data.data.map((item) => parseFloat(item.rasio));

  const maxValue = Math.max(...numericValues);
  const yAxisMax = Math.ceil(maxValue / 10) * 10 + 10;

  const seriesData = data.data.map((item) => ({
    value: parseFloat(item.rasio),
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
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      boundaryGap: true,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      max: yAxisMax,
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [
      {
        name: "Rasio",
        type: "bar",
        data: seriesData,
        barWidth: "60%",
        label: {
          show: true,
          position: "top",
          formatter: "{c}%",
          color: "#333",
        },
        // --- TAMBAHKAN KEMBALI BLOK markArea DENGAN WARNA BARU ---
        markArea: {
          silent: true,
          data: [
            // Area untuk Enabler
            [
              {
                name: "Enabler",
                xAxis: enablerFamilies[0],
                itemStyle: {
                  color: "rgba(59, 130, 246, 0.1)", // Biru transparan
                },
              },
              {
                xAxis: enablerFamilies[enablerFamilies.length - 1],
              },
            ],
            // Area untuk Revenue Generator
            [
              {
                name: "Revenue Generator",
                xAxis: revenueFamilies[0],
                itemStyle: {
                  color: "rgba(22, 163, 74, 0.1)", // Hijau transparan
                },
              },
              {
                xAxis: revenueFamilies[revenueFamilies.length - 1],
              },
            ],
          ],
        },
      },
      {
        name: "Enabler",
        type: "line",
        data: [],
        itemStyle: { color: "#3B82F6" },
      },
      {
        name: "Revenue Generator",
        type: "line",
        data: [],
        itemStyle: { color: "#16A34A" },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Employee Formation Rasio</h2>
      <div style={{ height: "400px" }}>
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default FormationRasioBarChart;
