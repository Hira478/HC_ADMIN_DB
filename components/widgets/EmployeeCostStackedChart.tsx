"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// ... (Interface dan COLORS tidak berubah)
interface StackedChartData {
  labels: string[];
  datasets: {
    managementCost: number[];
    employeeCost: number[];
    recruitment: number[];
    secondment: number[];
    others: number[];
  };
}

const COLORS = {
  employeeCost: "rgba(0, 74, 128, 0.75)",
  managementCost: "rgba(0, 128, 128, 0.75)",
  recruitment: "rgba(34, 197, 94, 0.75)",
  secondment: "rgba(217, 119, 6, 0.75)",
  others: "rgba(156, 163, 175, 0.7)",
};

const EmployeeCostStackedChart = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<StackedChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period || !period.year) return;
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
      });
      try {
        const response = await fetch(
          `/api/charts/employee-cost-breakdown?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: StackedChartData = await response.json();
        setChartData(data);
      } catch (_error) {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period.year]);

  // (Logika pemotongan data tidak berubah)
  let lastDataIndex = -1;
  if (chartData) {
    for (let i = chartData.labels.length - 1; i >= 0; i--) {
      const totalForMonth =
        (chartData.datasets.managementCost[i] ?? 0) +
        (chartData.datasets.employeeCost[i] ?? 0) +
        (chartData.datasets.recruitment[i] ?? 0) +
        (chartData.datasets.secondment[i] ?? 0) +
        (chartData.datasets.others[i] ?? 0);
      if (totalForMonth !== 0) {
        lastDataIndex = i;
        break;
      }
    }
  }

  const processedLabels = chartData?.labels.slice(0, lastDataIndex + 1) || [];
  const processedManagementCost =
    chartData?.datasets.managementCost.slice(0, lastDataIndex + 1) || [];
  const processedEmployeeCost =
    chartData?.datasets.employeeCost.slice(0, lastDataIndex + 1) || [];
  const processedRecruitment =
    chartData?.datasets.recruitment.slice(0, lastDataIndex + 1) || [];
  const processedSecondment =
    chartData?.datasets.secondment.slice(0, lastDataIndex + 1) || [];
  const processedOthers =
    chartData?.datasets.others.slice(0, lastDataIndex + 1) || [];

  // --- LOGIKA BARU: MENCARI NILAI MAKSIMAL UNTUK SUMBU Y ---
  // 1. Gabungkan semua data yang akan ditampilkan menjadi satu array
  const allDataValues = [
    ...processedManagementCost,
    ...processedEmployeeCost,
    ...processedRecruitment,
    ...processedSecondment,
    ...processedOthers,
  ];

  const markAreaData = processedLabels
    .map((month, index) => {
      if (index % 2 === 0) {
        return [{ xAxis: month }, { xAxis: month }];
      }
      return null;
    })
    .filter((area) => area !== null);

  const numberFormatter = (value: number) => {
    if (typeof value !== "number") return value;
    return value.toLocaleString("id-ID");
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      valueFormatter: numberFormatter,
    },
    legend: {
      data: [
        "Employee Cost",
        "Management Cost",
        "Recruitment",
        "Secondment",
        "Others",
      ],
      top: "10%",
    },
    xAxis: { type: "category", data: processedLabels },
    yAxis: {
      type: "value",
      axisLabel: { formatter: numberFormatter },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "22%",
      containLabel: true,
    },
    series: [
      // ... (seri bar tidak berubah)
      {
        name: "Employee Cost",
        type: "bar",
        barWidth: "22%",
        barGap: "-30%",
        data: processedEmployeeCost,
        itemStyle: { color: COLORS.employeeCost },
        markArea: {
          silent: true,
          data: markAreaData,
          itemStyle: { color: "rgba(0, 0, 0, 0.03)" },
        },
      },
      {
        name: "Management Cost",
        type: "bar",
        barWidth: "22%",
        barGap: "-30%",
        data: processedManagementCost,
        itemStyle: { color: COLORS.managementCost },
      },
      {
        name: "Recruitment",
        type: "bar",
        barWidth: "22%",
        barGap: "-30%",
        data: processedRecruitment,
        itemStyle: { color: COLORS.recruitment },
      },
      {
        name: "Secondment",
        type: "bar",
        barWidth: "22%",
        barGap: "-30%",
        data: processedSecondment,
        itemStyle: { color: COLORS.secondment },
      },
      {
        name: "Others",
        type: "bar",
        barWidth: "22%",
        barGap: "-30%",
        data: processedOthers,
        itemStyle: { color: COLORS.others },
      },
    ],
  };

  if (loading) return <CardLoader />;
  if (processedLabels.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-[432px] flex items-center justify-center text-gray-500">
        No Annual Cost Breakdown data available.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[432px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">
          Annual Employee Cost Analysis
        </h3>
        <div className="border border-gray-200 rounded-md px-2 py-1">
          <p className="text-xs font-semibold text-gray-500">Unit: Million</p>
        </div>
      </div>
      <div className="flex-grow h-full">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default EmployeeCostStackedChart;
