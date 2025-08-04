"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface ChartData {
  labels: string[];
  values: number[];
}

const AgeChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period.year) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          companyId: selectedCompany,
          type: period.type,
          year: String(period.year),
          value: String(period.value),
        });

        const response = await fetch(
          `/api/demography/age?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // --- DEBUGGING POINT 1: Lihat data mentah dari API ---
        console.log("Data diterima dari API /age:", data);
        // ----------------------------------------------------

        setChartData(data);
      } catch (error) {
        console.error("Fetch error for Age Chart:", error);
        setChartData({ labels: [], values: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]);

  // --- DEBUGGING POINT 2: Lihat isi state `chartData` sebelum render ---
  console.log("Dirender dengan chartData:", chartData);
  // -----------------------------------------------------------------

  const option = {
    grid: { left: "20%", right: "10%", top: "10%", bottom: "10%" },
    xAxis: {
      type: "value",
      show: false,
      splitLine: {
        show: true,
        lineStyle: { color: "#e0e6f1", type: "dashed" },
      },
    },
    yAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        data: (chartData?.values || []).map((value) => ({
          value,
          itemStyle: { color: "#C53030" },
        })),
        type: "bar",
        barWidth: "60%",
        label: { show: true, position: "right", color: "#1f2937" },
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full relative">
      <h3 className="font-bold text-lg text-gray-800">Age</h3>
      <ReactECharts option={option} style={{ height: 470 }} />
    </div>
  );
};

export default AgeChartCard;
