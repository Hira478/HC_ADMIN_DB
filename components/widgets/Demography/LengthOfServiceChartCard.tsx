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

  // --- 1. KALKULASI TOTAL DAN PERSENTASE ---
  const absoluteValues = chartData?.values || [];
  const totalEmployees = absoluteValues.reduce((sum, value) => sum + value, 0);
  const percentageValues = absoluteValues.map((value) =>
    totalEmployees > 0 ? (value / totalEmployees) * 100 : 0
  );

  // Kalkulasi sumbu Y dinamis berdasarkan persentase tertinggi
  const maxPercentage = Math.max(...percentageValues, 0);
  const yAxisMax = Math.min(100, Math.ceil(maxPercentage / 10) * 10 + 10);

  const option = {
    tooltip: {
      // 2. Ganti trigger ke 'axis' dan format tooltip untuk persen
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const data = params[0];
        return `${data.name} years<br/>Persentase: ${data.value.toFixed(1)}%`;
      },
    },
    grid: {
      top: "12%",
      bottom: "12%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
        interval: 0,
        color: "#6b7280",
        rotate: 30,
        margin: 6,
      },
    },
    yAxis: {
      type: "value",
      max: yAxisMax, // Gunakan batas atas dinamis
      // 3. Format label sumbu Y untuk menampilkan persen
      axisLabel: {
        fontSize: 10,
        margin: 2,
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
        // 4. Gunakan data persentase
        data: percentageValues,
        type: "bar",
        barWidth: "45%",
        color: "#C53030",
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f2937",
          // 5. Format label di atas bar untuk menampilkan persen
          formatter: (params: { value: number }) =>
            params.value > 0 ? `${params.value.toFixed(1)}%` : "",
        },
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
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
      <h3 className="font-bold text-lg text-gray-800 mb-2">
        Length of Service
      </h3>
      <div className="flex-1 -ml-1">
        <ReactECharts
          option={option}
          style={{
            height: "100%",
            width: "calc(100% + 8px)",
            minHeight: "250px",
          }}
        />
      </div>
    </div>
  );
};

export default LengthOfServiceChartCard;
