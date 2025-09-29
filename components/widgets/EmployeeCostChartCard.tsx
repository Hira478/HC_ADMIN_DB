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
    // Jangan fetch data jika filter belum siap
    if (!selectedCompany || !period || !period.value) return;

    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        month: String(period.value), // Kirim bulan yang dipilih
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
  }, [selectedCompany, period]);

  // Satu fungsi formatter yang andal untuk semua kebutuhan
  const numberFormatter = (value: number | { value: number } | null) => {
    // ECharts bisa mengirim objek atau angka, ekstrak nilainya
    const num =
      typeof value === "object" && value !== null ? value.value : value;

    // Pastikan itu angka sebelum memformat
    if (typeof num !== "number" || isNaN(num)) {
      return value;
    }

    // Format ke string dengan pemisah titik ribuan (standar Indonesia)
    return num.toLocaleString("id-ID");
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      // Terapkan formatter ke tooltip
      valueFormatter: numberFormatter,
    },
    legend: {
      data: ["Total Employee Cost", "Total Cost"],
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: chartData?.months || [],
    },
    yAxis: {
      type: "value",
      // Terapkan formatter ke sumbu Y
      axisLabel: { formatter: numberFormatter },
    },
    series: [
      {
        name: "Total Employee Cost",
        type: "bar",
        data: chartData?.totalEmployeeCost || [],
        itemStyle: { color: "#3B82F6" },
      },
      {
        name: "Total Cost",
        type: "line",
        smooth: false,
        data: chartData?.totalCost || [],
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
  if (!chartData || chartData.totalEmployeeCost.every((v) => v === 0))
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
