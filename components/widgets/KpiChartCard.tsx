"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Tipe data untuk KPI
interface KpiData {
  kpiHcTransformation: number;
  kpiKorporasi: number;
}

const KpiChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) return;
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        type: period.type,
        year: String(period.year),
        value: String(period.value),
      });
      try {
        const response = await fetch(`/api/charts/kpi?${params.toString()}`);
        if (!response.ok) throw new Error("Data not found");

        const dataArray: KpiData[] = await response.json();
        setKpiData(dataArray[0] || null);
      } catch (_error) {
        setKpiData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  // Konfigurasi ECharts yang sudah disesuaikan
  const option = {
    grid: {
      left: "1%",
      right: "15%",
      top: "5%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: 100,
      // 1. Tampilkan kembali garis sumbu dan labelnya
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: {
        show: true,
        formatter: "{value}%",
      },
      // 2. Tampilkan garis grid vertikal (splitLine)
      splitLine: {
        show: true,
        lineStyle: {
          color: "#E0E6F1", // Warna abu-abu muda
          type: "dashed", // Jenis garis putus-putus
        },
      },
    },
    yAxis: {
      type: "category",
      data: ["KPI Korporasi", "KPI Human Capital"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: "KPI",
        type: "bar",
        barWidth: "70%",
        data: [
          {
            value: kpiData?.kpiKorporasi || 0,
            itemStyle: { color: "#C53030" }, // Merah
          },
          {
            value: kpiData?.kpiHcTransformation || 0,
            itemStyle: { color: "#4A5568" }, // Abu-abu
          },
        ],
        label: {
          show: true,
          position: "insideRight",
          formatter: "{c}%",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
        },
      },
    ],
  };

  if (loading) return <CardLoader />;
  if (!kpiData)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        Data tidak tersedia.
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-base text-gray-800">KPI</h3>
          <p className="text-sm text-gray-500">{period.year}</p>
        </div>
        <div className="flex space-x-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-700 mr-2"></span>
            {/* Tambahkan leading-tight untuk spasi baris yang lebih rapat */}
            <span className="leading-tight">KPI Korporasi</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-gray-700 mr-2"></span>
            <span className="leading-tight">KPI HC Transformation</span>
          </div>
        </div>
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts
          option={option}
          style={{ height: "100%", minHeight: "120px" }}
        />
      </div>
    </div>
  );
};
export default KpiChartCard;
