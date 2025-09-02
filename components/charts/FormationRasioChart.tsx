"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { CogIcon } from "@heroicons/react/24/outline";
import InfoTooltip from "../ui/InfoTooltip";

// Tipe data yang diterima dari API
interface MonthData {
  month: string;
  totalHeadcount: number;
  categories: { [key: string]: number };
}

interface ChartProps {
  title: string;
  subtitle: string;
  data: MonthData[] | null;
  isLoading: boolean;
}

// FIX 2: Definisikan tipe untuk parameter tooltip agar tidak 'any'
interface TooltipParam {
  axisValueLabel: string;
  seriesName: string;
  value: number;
  marker: string;
}

// FIX 1: Ambil 'title' dan 'subtitle' dari props
const FormationRasioChart: React.FC<ChartProps> = ({
  title,
  subtitle,
  data,
  isLoading,
}) => {
  const legendDetails: { [key: string]: string } = {
    Strategy: "Strategi, Riset, & Pengembangan Bisnis",
    Finance: "Keuangan & Akuntansi",
    "HC & GA": "HR, GA & Sekretaris Perusahaan",
    Operation: "Aktuaria dan Operasi",
    Compliance: "Hukum, Manajemen Risiko dan SKAI",
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full h-[484px] flex justify-center items-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full h-[484px] flex justify-center items-center">
        <p>Data tidak tersedia untuk filter yang dipilih.</p>
      </div>
    );
  }

  const seriesNames = data.length > 0 ? Object.keys(data[0].categories) : [];
  const months = data.map((d) => d.month);

  const gradientPalette = [
    "#DBEAFE", // blue-100
    "#BFDBFE", // blue-200
    "#93C5FD", // blue-300
    "#60A5FA", // blue-400
    "#3B82F6", // blue-500
    "#2563EB", // blue-600
    "#1D4ED8", // blue-700
  ];

  const seriesData = seriesNames.map((name, index) => ({
    name: name,
    type: "bar",
    stack: "Total",
    emphasis: { focus: "series" },
    itemStyle: {
      color: gradientPalette[index % gradientPalette.length],
    },
    data: data.map((monthData) => {
      const total = monthData.totalHeadcount;
      const value = monthData.categories[name];
      return total > 0 ? parseFloat(((value / total) * 100).toFixed(2)) : 0;
    }),
  }));

  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // FIX 2: Gunakan tipe yang sudah didefinisikan
      formatter: (params: TooltipParam[]) => {
        const monthName = params[0].axisValueLabel;
        const monthData = data.find((d) => d.month === monthName);
        if (!monthData) return "";

        let tooltipText = `${monthName}<br/><b>Total Headcount: ${monthData.totalHeadcount}</b><br/><hr class='my-1' style='border-color: #ddd; margin: 4px 0;'>`;
        params.forEach((param: TooltipParam) => {
          const seriesName = param.seriesName;
          const value = monthData.categories[seriesName];
          const percent = param.value.toFixed(2);

          // Ambil nama detail dari kamus. Jika tidak ada, gunakan nama aslinya.
          tooltipText += `${param.marker} ${seriesName}: ${value} (${percent}%)<br/>`;
        });
        return tooltipText;
      },
    },
    legend: { show: false },
    grid: {
      left: "3%",
      right: "4%",
      top: "15%",
      bottom: "5%", // Kurangi bottom karena legenda kustom ada di luar
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: months,
      axisLabel: { interval: 0, rotate: 45 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: { formatter: "{value}%" },
    },
    series: seriesData,
  };

  return (
    <div className={`p-6 rounded-lg shadow-md w-full bg-white`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Satuan: %</span>
          <CogIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        </div>
      </div>
      <ReactECharts
        option={options}
        style={{ height: "400px", width: "100%" }}
      />
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 pt-4">
        {seriesNames.map((name, index) => (
          <div
            key={name}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  gradientPalette[index % gradientPalette.length],
              }}
            ></span>
            <span>{name}</span>
            <InfoTooltip content={legendDetails[name] || name} position="top" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormationRasioChart;
