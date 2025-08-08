"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

// Definisikan tipe untuk parameter formatter ECharts
interface EChartsFormatterParams {
  value: number;
  // Anda bisa tambahkan properti lain jika dibutuhkan, misal: name, seriesName
}

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

  const option = {
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
      axisLabel: {
        fontSize: 10,
        margin: 2,
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
        data: chartData?.values || [],
        type: "bar",
        barWidth: "45%",
        color: "#C53030",
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#1f2937",
          // Perbaikan di sini: ganti 'any' dengan tipe yang sudah didefinisikan
          formatter: (params: EChartsFormatterParams) =>
            params.value > 5 ? params.value : "",
        },
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        Memuat...
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
