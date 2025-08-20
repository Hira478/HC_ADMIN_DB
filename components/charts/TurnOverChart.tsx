// components/charts/TurnOverChart.tsx

"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

const TurnOverChart = () => {
  const options = {
    grid: { left: "20%", right: "5%", top: "5%", bottom: "5%" },
    xAxis: {
      type: "value",
      show: false, // Sembunyikan sumbu X
    },
    yAxis: {
      type: "category",
      data: ["May", "Apr", "Mar", "Feb", "Jan"], // Dibalik agar Mei di bawah
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#E5E7EB" },
    },
    series: [
      {
        name: "Turn Over",
        type: "bar",
        data: [2, 5, 2, 3, 2], // Dibalik juga
        barWidth: "60%",
        itemStyle: { color: "#DC2626" },
        label: {
          show: true,
          position: "insideRight",
          color: "#fff",
          fontWeight: "bold",
          distance: 5,
        },
      },
    ],
    backgroundColor: "transparent",
  };

  return (
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white h-full">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-md font-semibold text-gray-300">Turn Over Ratio</h3>
        <div>
          <span className="text-4xl font-bold">6.4%</span>
          <span className="ml-2 text-red-400">-2%</span>
        </div>
      </div>
      <ReactECharts option={options} style={{ height: "250px" }} />
    </div>
  );
};

export default TurnOverChart;
