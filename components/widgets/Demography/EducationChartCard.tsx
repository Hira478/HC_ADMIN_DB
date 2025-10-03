"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface ChartData {
  labels: string[];
  values: number[];
}

// --- DIUBAH: Definisikan warna utama untuk chart ini ---
const CHART_COLOR = "rgba(0, 128, 128, 0.9)"; // Teal

const EducationChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany === null || !period) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
          type: period.type,
          year: String(period.year),
          value: String(period.value),
        });

        const response = await fetch(
          `/api/demography/education?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Fetch error for Education Chart:", error);
        setChartData({ labels: [], values: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]);

  const absoluteValues = chartData?.values || [];
  const totalEmployees = absoluteValues.reduce((sum, value) => sum + value, 0);
  const percentageValues = absoluteValues.map((value) =>
    totalEmployees > 0 ? (value / totalEmployees) * 100 : 0
  );

  const maxPercentage = Math.max(...percentageValues, 0);
  const yAxisMax = Math.min(100, Math.ceil(maxPercentage / 10) * 10 + 10);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const data = params[0];
        return `${data.name}<br/>${data.value.toFixed(1)}%`;
      },
    },
    grid: { top: "20%", bottom: "20%", left: "10%", right: "5%" },
    xAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
        interval: 0,
        color: "#6b7280",
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      max: yAxisMax,
      axisLabel: {
        formatter: "{value}%",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e6f1",
          type: "dashed",
        },
      },
    },
    series: [
      {
        data: percentageValues,
        type: "bar",
        barWidth: "50%",
        // --- DIUBAH: Gunakan warna yang sudah didefinisikan ---
        color: CHART_COLOR,
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f2937",
          formatter: (params: { value: number }) =>
            `${params.value.toFixed(1)}%`,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Education</h3>
      <ReactECharts option={option} style={{ height: "calc(100% - 40px)" }} />
    </div>
  );
};
export default EducationChartCard;
