// components/widgets/EmployeeStatusChart.tsx
"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext"; // <-- Tambahkan ini
import CardLoader from "./CardLoader"; // <-- Tambahkan ini

// Definisikan tipe untuk data chart agar lebih aman
interface ChartData {
  name: string;
  value: number;
  itemStyle: {
    color: string;
  };
}

const EmployeeStatusChart = () => {
  const { selectedCompany, period } = useFilters(); // <-- Ambil filter
  const [chartData, setChartData] = useState<ChartData[] | null>(null); // <-- State untuk data dinamis
  const [loading, setLoading] = useState(true); // <-- State untuk loading

  // --- Gunakan useEffect untuk mengambil data dari API ---
  useEffect(() => {
    if (!selectedCompany || !period) return;

    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        type: period.type,
        year: String(period.year),
        value: String(period.value),
      });
      try {
        // Ganti dengan path API Anda yang benar untuk status karyawan
        const response = await fetch(`/api/charts/status?${params.toString()}`);
        if (!response.ok) throw new Error("Data not found");
        const data: ChartData[] = await response.json();

        // Cek jika data yang diterima adalah array kosong atau isinya hanya 0
        const isDataEmpty =
          data.length === 0 || data.every((d) => d.value === 0);
        setChartData(isDataEmpty ? null : data);
      } catch (_error) {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);
  // --- Akhir dari useEffect ---

  const option = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" }, // Formatter tooltip agar lebih informatif
    legend: {
      orient: "vertical",
      left: "left",
      top: "center",
      // Map data untuk legend
      data: chartData?.map((item) => item.name) || [],
    },
    series: [
      {
        name: "Employee Status",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%", // Ini akan menampilkan persentase
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
        },
        emphasis: {
          label: { show: true, fontSize: "20", fontWeight: "bold" },
        },
        labelLine: { show: false },
        // Gunakan data dari state
        data: chartData,
      },
    ],
  };

  if (loading) return <CardLoader />;

  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        No Data.
      </div>
    );
  }

  return <ReactECharts option={option} style={{ height: 250 }} />;
};

export default EmployeeStatusChart;
