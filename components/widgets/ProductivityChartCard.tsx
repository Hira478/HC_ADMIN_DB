// components/widgets/ProductivityChartCard.tsx
"use client";

import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";

const ProductivityChartCard = () => {
  // Data dummy, idealnya dari API
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],
    revenue: [55, 30, 45, 60, 50],
    netProfit: [35, 20, 30, 40, 35],
    revenuePerEmployee: [15, 10, 12, 18, 8],
    netProfitPerEmployee: [10, 5, 8, 12, 4],
  };

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      data: [
        "Revenue",
        "Net Profit",
        "Revenue/Employee",
        "Net Profit/Employee",
      ],
      top: "top", // Pindahkan legend ke atas
      itemWidth: 15,
      itemHeight: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData.months,
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Revenue",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.revenue,
        color: "#d53f8c", // Warna pink/merah
      },
      {
        name: "Net Profit",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.netProfit,
        color: "#f6ad55", // Warna oranye
      },
      {
        name: "Revenue/Employee",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.revenuePerEmployee,
        color: "#38a169", // Warna hijau
      },
      {
        name: "Net Profit/Employee",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.netProfitPerEmployee,
        color: "#3182ce", // Warna biru
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-lg text-gray-800">Productivity</h3>
        </div>
        <button className="text-gray-500 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  );
};

export default ProductivityChartCard;
