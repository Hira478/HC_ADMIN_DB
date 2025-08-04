// components/widgets/ProductivityChart.tsx
"use client";

import ReactECharts from "echarts-for-react";
// Asumsikan data sudah di-fetch, mirip dengan contoh sebelumnya

const ProductivityChart = () => {
  // Data dummy, idealnya ini di-fetch dari API
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    productivity: [10, 12, 15, 13, 16, 18],
    revenuePerEmployee: [8, 9, 11, 10, 12, 14],
    netProfitPerEmployee: [3, 4, 5, 4.5, 6, 7],
  };

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["Productivity", "Revenue/Employee", "Net Profit/Employee"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
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
        name: "Productivity",
        type: "line",
        stack: "Total", // 'stack' membuat area chart bertumpuk
        areaStyle: {},
        emphasis: { focus: "series" },
        data: chartData.productivity,
      },
      {
        name: "Revenue/Employee",
        type: "line",
        stack: "Total",
        areaStyle: {},
        emphasis: { focus: "series" },
        data: chartData.revenuePerEmployee,
      },
      {
        name: "Net Profit/Employee",
        type: "line",
        stack: "Total",
        areaStyle: {},
        emphasis: { focus: "series" },
        data: chartData.netProfitPerEmployee,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
};

export default ProductivityChart;
