"use client";

import ReactECharts from "echarts-for-react";

const KpiChartCard = () => {
  const option = {
    grid: {
      left: "5%",
      right: "10%",
      top: "5%",
      bottom: "5%",
    },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      axisLine: { show: false },
      axisTick: { show: false },
      data: ["KPI HC Transformation", "KPI Korporasi"],
      inverse: true,
      show: false,
    },
    series: [
      {
        name: "KPI",
        type: "bar",
        barWidth: "50%",
        data: [
          { value: 42, itemStyle: { color: "#4A5568" } },
          { value: 58, itemStyle: { color: "#C53030" } },
        ],
        label: {
          show: true,
          position: "insideRight",
          formatter: "{c}%",
          color: "#fff",
          fontWeight: "bold",
        },
      },
    ],
  };

  return (
    // Pastikan ada flex flex-col di sini
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      {/* 1. Beri tinggi tetap (h-24) pada area header & legend */}
      <div className="h-24">
        {/* Header Kartu */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-gray-800">KPI</h3>
            <p className="text-sm text-gray-500">2025</p>
          </div>
        </div>

        {/* Legend Custom */}
        <div className="flex space-x-4 text-xs text-gray-600 mb-2">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-700 mr-2"></span>
            KPI Korporasi
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-gray-700 mr-2"></span>
            KPI HC Transformation
          </div>
        </div>
      </div>

      {/* 2. Area chart akan otomatis mengisi sisa ruang */}
      <div className="flex-grow min-h-0">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default KpiChartCard;
