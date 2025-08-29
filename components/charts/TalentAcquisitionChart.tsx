"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import CardLoader from "../widgets/CardLoader";

interface ChartData {
  categories: string[];
  data: number[];
}

interface TalentAcquisitionChartProps {
  title: string;
  subtitle: string;
  chartData: ChartData | null;
  isLoading: boolean;
  yAxisUnitLabel?: string;
  containerClassName?: string;
}

const TalentAcquisitionChart: React.FC<TalentAcquisitionChartProps> = ({
  title,
  subtitle,
  chartData,
  isLoading,
  yAxisUnitLabel,
  containerClassName = "bg-white",
}) => {
  const options = {
    tooltip: {
      trigger: "axis",
    },
    // 1. Beri ruang lebih di kiri untuk label sumbu Y
    grid: {
      left: "8%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData?.categories || [],
    },
    yAxis: {
      type: "value",
      // 2. Batasi jumlah garis agar tidak tumpang tindih
      splitNumber: 4,
      // 3. Hapus formatter agar menampilkan angka biasa (tidak ada "K" atau "M")
    },
    series: [
      {
        data: chartData?.data || [],
        type: "line",
        smooth: true,
        areaStyle: {
          color: "#FEE2E2",
          opacity: 0.6,
        },
        lineStyle: {
          color: "#DC2626",
        },
        itemStyle: {
          color: "#DC2626",
        },
        showSymbol: true,
        symbolSize: 6,
        label: {
          show: true,
          position: "top",
          color: "#374151",
          fontWeight: "normal",
          fontSize: 12,
        },
      },
    ],
  };

  if (isLoading) {
    return <CardLoader />;
  }

  if (!chartData || chartData.data.length === 0) {
    return (
      <div
        className={`${containerClassName} p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center`}
      >
        <p>Data tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div
      className={`${containerClassName} p-6 rounded-lg shadow-md h-full flex flex-col`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {yAxisUnitLabel && (
          <span className="text-sm text-gray-500">
            Satuan : {yAxisUnitLabel}
          </span>
        )}
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts option={options} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default TalentAcquisitionChart;
