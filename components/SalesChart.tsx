// components/SalesChart.tsx
"use client";

import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

interface SalesData {
  month: string;
  revenue: number;
}

const SalesChart = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sales");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%", // Sesuaikan bottom agar ruang untuk dataZoom cukup
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: data.map((item) => item.month),
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          formatter: "${value}",
        },
      },
    ],
    series: [
      {
        name: "Pendapatan",
        type: "bar",
        barWidth: "60%",
        data: data.map((item) => item.revenue),
        color: "#3b82f6",
      },
    ],
    // Tambahkan konfigurasi dataZoom
    dataZoom: [
      {
        type: "slider", // Tipe dataZoom: slider (ada juga 'inside')
        start: 0, // Posisi awal slider (0-100, persentase)
        end: 50, // Posisi akhir slider
      },
    ],
  };

  if (loading) {
    return <div className="text-center p-10">Memuat data chart...</div>;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 400 }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default SalesChart;
