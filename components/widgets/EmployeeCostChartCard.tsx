// components/widgets/EmployeeCostChartCard.tsx
"use client";

import ReactECharts from "echarts-for-react";
import { Settings } from "lucide-react";

const EmployeeCostChartCard = () => {
  // Data dummy untuk employee cost
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],
    sallary: [30, 15, 25, 15, 30],
    insentive: [25, 10, 20, 10, 25],
    pension: [10, 5, 8, 5, 10],
    others: [10, 2, 5, 2, 5],
  };

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["Employee Sallary", "Insentive", "Pension", "Others"],
      top: "top",
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
        name: "Employee Sallary",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.sallary,
        color: "#A0522D", // Coklat
      },
      {
        name: "Insentive",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.insentive,
        color: "#C53030", // Merah
      },
      {
        name: "Pension",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.pension,
        color: "#808000", // Olive
      },
      {
        name: "Others",
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.7 },
        emphasis: { focus: "series" },
        data: chartData.others,
        color: "#483D8B", // Biru gelap
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Employee Cost</h3>
          <p className="text-sm text-gray-500">2025</p>
        </div>
        <button className="text-gray-500 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  );
};

export default EmployeeCostChartCard;
