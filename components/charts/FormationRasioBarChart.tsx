// File: components/charts/FormationRasioBarChart.tsx
"use client";

import React, { useEffect, useState } from "react"; // DIUBAH: Tambahkan useEffect dan useState
import ReactECharts from "echarts-for-react";
import type { FormationRasioTableData } from "@/types";
import { useFilters } from "@/contexts/FilterContext"; // DIUBAH: Tambahkan useFilters

interface ChartProps {
  data: FormationRasioTableData | null;
  isLoading: boolean;
}

const enablerFamilies = ["IT", "HC & GA", "Finance", "Compliance"];
const revenueFamilies = ["Strategy", "Business", "Operation"];

const FormationRasioBarChart: React.FC<ChartProps> = ({ data, isLoading }) => {
  // --- PERUBAHAN 1: Tambahkan state untuk headcount dan ambil filter dari context ---
  const [totalHeadcount, setTotalHeadcount] = useState<number | null>(null);
  const { selectedCompany, period } = useFilters();

  // --- PERUBAHAN 2: useEffect untuk mengambil data headcount ---
  useEffect(() => {
    if (!selectedCompany || !period.value) {
      return;
    }

    const fetchHeadcount = async () => {
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        month: String(period.value),
      });

      try {
        const response = await fetch(
          `/api/headcount/total?${params.toString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch headcount");
        const data = await response.json();
        setTotalHeadcount(data.totalHeadcount);
      } catch (error) {
        console.error(error);
        setTotalHeadcount(0); // Set ke 0 jika gagal
      }
    };

    fetchHeadcount();
  }, [selectedCompany, period]);

  if (isLoading) {
    // ... (kode loading tidak berubah)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        <p>Loading Chart...</p>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    // ... (kode 'No data' tidak berubah)
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
    // --- PERUBAHAN 3: Tambahkan elemen 'graphic' untuk menampilkan teks headcount ---
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: "{b}<br/>Rasio: {c}%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%", // Beri sedikit ruang di atas
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
        markArea: {
          silent: true,
          data: [
            [
              {
                name: "Enabler",
                xAxis: enablerFamilies[0],
                itemStyle: { color: "rgba(59, 130, 246, 0.1)" },
              },
              { xAxis: enablerFamilies[enablerFamilies.length - 1] },
            ],
            [
              {
                name: "Revenue Generator",
                xAxis: revenueFamilies[0],
                itemStyle: { color: "rgba(22, 163, 74, 0.1)" },
              },
              { xAxis: revenueFamilies[revenueFamilies.length - 1] },
            ],
          ],
        },
      },
      // ... (seri dummy untuk legend tidak berubah)
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      {/* --- PERUBAHAN 2: Buat header dengan Flexbox --- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Formation Rasio</h2>
        {/* Kotak untuk Total Headcount */}
        <div className="border border-gray-300 rounded-md px-3 py-1">
          <p className="text-sm font-semibold text-gray-600">
            Total Headcount:{" "}
            <span className="text-gray-800">
              {totalHeadcount !== null
                ? totalHeadcount.toLocaleString("id-ID")
                : "..."}
            </span>
          </p>
        </div>
      </div>

      <div style={{ height: "400px" }}>
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default FormationRasioBarChart;
