"use client";

import ReactECharts from "echarts-for-react";

const dummyChartData = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [74.2, 102.5, 98.9, 108.3],
};

const KpiSidewaysChart = () => {
  const option = {
    // DIUBAH: Padding internal dikurangi agar bar lebih besar
    grid: {
      left: "0%",
      right: "5%",
      top: "5%",
      bottom: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: 120,
      axisLabel: {
        fontSize: 10,
        formatter: "{value}%",
      },
      splitLine: {
        show: true,
        lineStyle: { color: "#e0e6f1", type: "dashed" },
      },
    },
    yAxis: {
      type: "category",
      data: dummyChartData.labels,
      axisLabel: { fontSize: 11, fontWeight: "bold" },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        data: dummyChartData.values.map((value) => ({
          value,
          itemStyle: {
            color: value > 100 ? "#2F855A" : "#2D3748",
            borderRadius: [0, 5, 5, 0],
          },
        })),
        type: "bar",
        // DIUBAH: Lebar bar ditambah agar lebih tebal di ruang yang lebih sempit
        barWidth: "50%",
        label: {
          show: true,
          position: "right",
          fontSize: 11,
          fontWeight: "bold",
          color: "#1f2937",
          formatter: (params: { value: number }) =>
            `${params.value.toFixed(1)}%`,
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const data = params[0];
        return `<strong>${
          data.name
        }</strong><br/>Total Score: ${data.value.toFixed(1)}%`;
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">KPI</h3>
      {/* DIUBAH: Tinggi container dikurangi dari 350px menjadi 280px */}
      <div className="h-[280px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default KpiSidewaysChart;
