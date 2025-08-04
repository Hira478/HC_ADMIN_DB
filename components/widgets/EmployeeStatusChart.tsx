// components/widgets/EmployeeStatusChart.tsx
"use client";
import ReactECharts from "echarts-for-react";

const EmployeeStatusChart = () => {
  // Data dummy
  const data = [
    { value: 385, name: "Permanent" },
    { value: 250, name: "Contract" },
  ];

  const option = {
    tooltip: { trigger: "item" },
    legend: {
      orient: "vertical",
      left: "left",
      top: "center",
    },
    series: [
      {
        name: "Employee Status",
        type: "pie",
        radius: ["50%", "70%"], // Ini yang membuatnya menjadi donut
        avoidLabelOverlap: false,
        label: { show: false, position: "center" },
        emphasis: {
          label: { show: true, fontSize: "20", fontWeight: "bold" },
        },
        labelLine: { show: false },
        data: data,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 250 }} />;
};

export default EmployeeStatusChart;
