// components/widgets/KpiChartCard.tsx
"use client";

import ReactECharts from "echarts-for-react";

const KpiChartCard = () => {
  const option = {
    grid: {
      left: "5%",
      right: "10%",
      top: "20%", // Ruang untuk legend custom
      bottom: "5%",
    },
    xAxis: {
      type: "value",
      show: false, // Sembunyikan sumbu X
    },
    yAxis: {
      type: "category",
      axisLine: { show: false }, // Sembunyikan garis sumbu Y
      axisTick: { show: false }, // Sembunyikan tick sumbu Y
      data: ["KPI HC Transformation", "KPI Korporasi"], // Data harus dibalik agar 'Korporasi' di atas
      inverse: true,
      show: false, // Sembunyikan label sumbu Y
    },
    series: [
      {
        name: "KPI",
        type: "bar",
        barWidth: "50%",
        data: [
          {
            value: 42,
            itemStyle: { color: "#4A5568" }, // Warna abu-abu gelap
          },
          {
            value: 58,
            itemStyle: { color: "#C53030" }, // Warna merah
          },
        ],
        label: {
          show: true,
          position: "insideRight",
          formatter: "{c}%", // Tampilkan nilai dengan format persen
          color: "#fff",
          fontWeight: "bold",
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
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

      {/* Chart */}
      <ReactECharts option={option} style={{ height: "280px" }} />
    </div>
  );
};

export default KpiChartCard;
