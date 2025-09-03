"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface ChartData {
  labels: string[];
  values: number[];
}

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

  const option = {
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
      show: true,
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
        data: chartData?.values || [],
        type: "bar",
        barWidth: "50%",
        color: "#4A5568",
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f2937",
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
