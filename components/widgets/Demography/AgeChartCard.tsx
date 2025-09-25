"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

// Definisikan tipe untuk parameter formatter ECharts
interface EChartsFormatterParams {
  name: string;
  value: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

const AgeChartCard = () => {
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
          `/api/demography/age?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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

  // --- 1. KALKULASI TOTAL DAN PERSENTASE ---
  const absoluteValues = chartData?.values || [];
  const totalEmployees = absoluteValues.reduce((sum, value) => sum + value, 0);
  const percentageValues = absoluteValues.map((value) =>
    totalEmployees > 0 ? (value / totalEmployees) * 100 : 0
  );

  // Kalkulasi sumbu X dinamis berdasarkan persentase tertinggi
  const maxPercentage = Math.max(...percentageValues, 0);
  const xAxisMax = Math.min(100, Math.ceil(maxPercentage / 10) * 10);

  const option = {
    grid: {
      left: "5%",
      right: "5%",
      top: "10%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: xAxisMax, // Gunakan batas atas dinamis
      // 2. Format label sumbu X (sumbu nilai) untuk menampilkan persen
      axisLabel: {
        fontSize: 10,
        margin: 1,
        formatter: "{value}%",
      },
      axisLine: { show: true, lineStyle: { width: 1 } },
      splitLine: {
        show: true,
        lineStyle: { color: "#e0e6f1", type: "dashed" },
      },
      boundaryGap: ["0%", "2%"],
    },
    yAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisLabel: { fontSize: 11, margin: 1 },
      axisLine: { show: true },
      axisTick: { show: true },
    },
    series: [
      {
        // 3. Gunakan data persentase
        data: percentageValues.map((value) => ({
          value,
          itemStyle: {
            color: "#C53030",
            borderRadius: [0, 3, 3, 0],
          },
        })),
        type: "bar",
        barWidth: "45%",
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          color: "#1f2937",
          // 4. Format label di ujung bar untuk menampilkan persen & perbaiki typo 'fformatter'
          formatter: (params: { value: number }) =>
            `${params.value.toFixed(1)}%`,
        },
        emphasis: {
          itemStyle: {
            shadowColor: "rgba(0, 0, 0, 0.5)",
            shadowBlur: 5,
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // 5. Format tooltip untuk menampilkan persen
      formatter: (params: Array<{ name: string; value: number }>) => {
        const data = params[0];
        return `<strong>${
          data.name
        }</strong><br/>Persentase: ${data.value.toFixed(1)}%`;
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-bold text-lg text-gray-800">Age</h3>
      </div>
      <div className="flex-1 -ml-1.5">
        <ReactECharts
          option={option}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "250px",
          }}
        />
      </div>
    </div>
  );
};

export default AgeChartCard;
