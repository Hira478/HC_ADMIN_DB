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
          fontSize: 18,
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="pb-4">
        {/* Header Kartu */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {/* PERUBAHAN: Style disamakan dengan judul StatCard */}
            <h3 className="font-semibold text-base text-gray-800">KPI</h3>
            {/* PERUBAHAN: Ukuran font disesuaikan untuk hirarki */}
            <p className="text-sm text-gray-500">2025</p>
          </div>
        </div>

        {/* Legend Custom */}
        <div className="flex space-x-6 text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-700 mr-2"></span>
            KPI Korporasi
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-gray-700 mr-2"></span>
            KPI HC Transformation
          </div>
        </div>
      </div>

      {/* Area chart akan otomatis mengisi sisa ruang */}
      <div className="flex-grow min-h-0">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default KpiChartCard;
