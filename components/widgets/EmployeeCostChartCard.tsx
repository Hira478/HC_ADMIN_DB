"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

interface EmployeeCostChartData {
  months: string[];
  totalEmployeeCost: number[];
  totalCost: number[];
}

const EmployeeCostChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<EmployeeCostChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period || !period.year) return;

    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
      });

      try {
        const response = await fetch(
          `/api/charts/employee-cost?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: EmployeeCostChartData = await response.json();
        setChartData(data);
      } catch (_error) {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period.year]);

  // --- LOGIKA BARU: Hapus bulan dengan data nol di akhir ---
  let lastDataIndex = -1;
  if (chartData && chartData.months) {
    // Cari dari belakang, index bulan terakhir yang punya data > 0
    for (let i = chartData.months.length - 1; i >= 0; i--) {
      if (
        (chartData.totalEmployeeCost[i] ?? 0) > 0 ||
        (chartData.totalCost[i] ?? 0) > 0
      ) {
        lastDataIndex = i;
        break; // Hentikan loop setelah ditemukan
      }
    }
  }

  // Potong array data berdasarkan index terakhir yang ditemukan
  const processedMonths = chartData?.months.slice(0, lastDataIndex + 1) || [];
  const processedEmployeeCost =
    chartData?.totalEmployeeCost.slice(0, lastDataIndex + 1) || [];
  const processedTotalCost =
    chartData?.totalCost.slice(0, lastDataIndex + 1) || [];

  const numberFormatter = (value: number | { value: number } | null) => {
    const num =
      typeof value === "object" && value !== null ? value.value : value;
    if (typeof num !== "number" || isNaN(num)) return value;
    return num.toLocaleString("id-ID");
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      valueFormatter: numberFormatter,
    },
    legend: {
      data: ["Total Employee Cost", "Total Cost"],
      top: "10%",
    },
    xAxis: {
      type: "category",
      // Gunakan data bulan yang sudah diproses
      data: processedMonths,
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: numberFormatter },
    },
    series: [
      {
        name: "Total Employee Cost",
        type: "bar",
        // Gunakan data yang sudah diproses
        data: processedEmployeeCost,
        itemStyle: { color: "#3B82F6" },
      },
      {
        name: "Total Cost",
        type: "line",
        smooth: false,
        // Gunakan data yang sudah diproses
        data: processedTotalCost,
        itemStyle: { color: "#EF4444" },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "20%",
      containLabel: true,
    },
    title: {
      text: "Cost Analysis",
      left: "center",
      textStyle: { fontSize: 16, fontWeight: "bold" },
    },
  };

  if (loading) return <CardLoader />;
  // Kondisi 'No Data' diperbarui untuk mengecek data yang sudah diproses
  if (
    processedEmployeeCost.length === 0 ||
    processedEmployeeCost.every((v) => v === 0)
  )
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-96 flex items-center justify-center text-gray-500">
        No Chart Data.
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96 flex flex-col">
      <ReactECharts option={option} style={{ height: "100%" }} />
    </div>
  );
};

export default EmployeeCostChartCard;
