"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Define a specific type for the KPI data
interface KpiData {
  kpiHcTransformation: number;
  kpiKorporasi: number;
}

const KpiChartCard = () => {
  const { selectedCompany, period } = useFilters();
  // Use the specific type for state instead of 'any'
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) return;
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        type: "yearly", // <-- PAKSA TIPE MENJADI 'yearly'
        year: String(period.year),
        value: "1", // Nilai 'value' tidak relevan, tapi kita isi 1
      });
      try {
        const response = await fetch(`/api/charts/kpi?${params.toString()}`);
        if (!response.ok) throw new Error("Data not found");
        const data: KpiData = await response.json();
        setKpiData(data);
      } catch (_error) {
        // Fix: unused variable warning
        setKpiData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  const option = {
    grid: { left: "5%", right: "10%", top: "5%", bottom: "5%" },
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
          {
            value: kpiData?.kpiHcTransformation || 0,
            itemStyle: { color: "#4A5568" },
          },
          {
            value: kpiData?.kpiKorporasi || 0,
            itemStyle: { color: "#C53030" },
          },
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
        <div className="flex space-x-6 text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-700 mr-2"></span>KPI
            Korporasi
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-gray-700 mr-2"></span>KPI
            HC Transformation
          </div>
        </div>
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};
export default KpiChartCard;
