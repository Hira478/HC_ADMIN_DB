"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Re-render chart ketika data berubah
  useEffect(() => {
    if (chartRef.current && chartData) {
      chartRef.current.getEchartsInstance().resize();
    }
  }, [chartData]);

  const options = {
    tooltip: {
      trigger: "axis",
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
      data: chartData?.categories || [],
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1e6) return value / 1e6 + "M";
          if (value >= 1e3) return value / 1e3 + "K";
          return value;
        },
      },
    },
    series: [
      {
        data: chartData?.data || [],
        type: "line",
        smooth: false,
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
          show: false,
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
        <p>No Data.</p>
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
          <span className="text-sm text-gray-500">Unit : {yAxisUnitLabel}</span>
        )}
      </div>
      <div className="flex-grow min-h-0">
        {isMounted && (
          <ReactECharts
            ref={chartRef}
            option={options}
            style={{ height: "100%", minHeight: "220px" }}
            opts={{ renderer: "canvas" }}
          />
        )}
      </div>
    </div>
  );
};

export default TalentAcquisitionChart;
