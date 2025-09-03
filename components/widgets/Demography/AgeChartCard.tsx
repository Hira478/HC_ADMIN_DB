"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface EChartsFormatterParams {
  name: string;
  value: number;
  // Anda bisa tambahkan properti lain jika dibutuhkan, misal: seriesName
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

  const option = {
    grid: {
      left: "5%", // Further reduced from 8%
      right: "5%", // Further reduced from 3%
      top: "10%", // Reduced from 12%
      bottom: "10%", // Reduced from 12%
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        fontSize: 10,
        margin: 1, // Reduced from 2
      },
      axisLine: {
        show: true, // Pastikan ini true untuk kontrol penuh
        lineStyle: {
          width: 1,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e6f1",
          type: "dashed",
        },
      },
      boundaryGap: ["0%", "2%"],
    },
    yAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisLabel: {
        fontSize: 11, // Slightly reduced from 12
        margin: 1, // Reduced from 2
      },
      axisLine: { show: true },
      axisTick: { show: true },
    },
    series: [
      {
        data: (chartData?.values || []).map((value) => ({
          value,
          itemStyle: {
            color: "#C53030",
            borderRadius: [0, 3, 3, 0], // Rounded right corners only
          },
        })),
        type: "bar",
        barWidth: "45%", // Reduced from 50%
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          color: "#1f2937",
          fformatter: (params: EChartsFormatterParams) =>
            params.value > 5 ? params.value : "",
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
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: EChartsFormatterParams[]) => {
        const data = params[0];
        return `<strong>${data.name}</strong><br/>Count: ${data.value}`;
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
        {" "}
        {/* Changed from items-start */}
        <h3 className="font-bold text-lg text-gray-800">Age</h3>
      </div>
      <div className="flex-1 -ml-1.5">
        {" "}
        {/* Increased negative margin */}
        <ReactECharts
          option={option}
          style={{
            height: "100%",
            width: "100%", // Increased from 8px
            minHeight: "250px",
          }}
        />
      </div>
    </div>
  );
};

export default AgeChartCard;
