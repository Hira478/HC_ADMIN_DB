"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface ChartData {
  labels: string[];
  values: number[];
}

const LengthOfServiceChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) return;

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
          `/api/demography/service-length?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Fetch error in LengthOfServiceChartCard:", error);
        setChartData({ labels: [], values: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, period]);

  const option = {
    grid: { top: "15%", bottom: "15%", left: "5%", right: "5%" },
    xAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      show: false,
      splitLine: {
        show: true,
        lineStyle: { color: "#e0e6f1", type: "dashed" },
      },
    },
    series: [
      {
        data: chartData?.values || [],
        type: "bar",
        barWidth: "60%",
        color: "#C53030",
        label: { show: true, position: "top", color: "#1f2937" },
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
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="font-bold text-lg text-gray-800">Length of Service</h3>
      <ReactECharts option={option} style={{ height: 250 }} />
    </div>
  );
};
export default LengthOfServiceChartCard;
