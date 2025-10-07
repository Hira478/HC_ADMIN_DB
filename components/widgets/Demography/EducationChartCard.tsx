"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import { EChartsOption } from "echarts";

interface EducationApiData {
  labels: string[];
  permanent: { label: string; values: number[] };
  contract: { label: string; values: number[] };
  total: { label: string; values: number[] };
}

// ## 1. ADD 'TOTAL' COLOR ##
const COLORS = {
  permanent: "#0d9488", // Teal lebih gelap
  contract: "#5eead4", // Teal lebih terang
  total: "#0f766e", // Warna solid untuk mode 'all'
};

const EducationChartCard = () => {
  const { selectedCompany, period, statusFilter } = useFilters();
  const [chartData, setChartData] = useState<EducationApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... Fetch logic is already correct ...
    if (!selectedCompany || !period) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
          type: period.type,
          year: String(period.year),
          value: String(period.value),
          status: statusFilter,
        });
        const response = await fetch(
          `/api/demography/education?${params.toString()}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: EducationApiData = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Fetch error for Education Chart:", error);
        setChartData({
          labels: [],
          permanent: { label: "Permanent", values: [] },
          contract: { label: "Contract", values: [] },
          total: { label: "Total", values: [] },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period, statusFilter]);

  // ... Percentage calculation logic is already correct ...
  const permanentValues = chartData?.permanent.values || [];
  const contractValues = chartData?.contract.values || [];
  const totalValues = chartData?.total.values || [];
  const grandTotal =
    permanentValues.reduce((a, b) => a + b, 0) +
    contractValues.reduce((a, b) => a + b, 0);
  const permanentPercentage = permanentValues.map((v) =>
    grandTotal > 0 ? (v / grandTotal) * 100 : 0
  );
  const contractPercentage = contractValues.map((v) =>
    grandTotal > 0 ? (v / grandTotal) * 100 : 0
  );
  const totalPercentage = totalValues.map((v) =>
    grandTotal > 0 ? (v / grandTotal) * 100 : 0
  );
  const yAxisMax = Math.ceil(Math.max(...totalPercentage, 0) / 10) * 10 + 10;

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // ## 2. UPDATE TOOLTIP LOGIC ##
      formatter: (params) => {
        const paramArray = params as {
          seriesName: string;
          name: string;
          dataIndex: number;
          marker: string;
          value: number;
        }[];
        if (!paramArray || paramArray.length === 0 || paramArray[0].value === 0)
          return ""; // Jangan tampilkan tooltip jika nilainya 0

        const categoryName = paramArray[0].name;
        let tooltipContent = `<strong>${categoryName}</strong><br/>`;

        if (statusFilter === "all") {
          const permPercent = permanentPercentage[paramArray[0].dataIndex] || 0;
          const contPercent = contractPercentage[paramArray[0].dataIndex] || 0;

          if (permPercent > 0)
            tooltipContent += `<div style="display:flex; align-items:center; margin-top: 5px;">${
              paramArray[0].marker
            }<span style="margin-left:5px;">Permanent: ${permPercent.toFixed(
              1
            )}%</span></div>`;
          if (contPercent > 0)
            tooltipContent += `<div style="display:flex; align-items:center;">${
              paramArray[1].marker
            }<span style="margin-left:5px;">Contract: ${contPercent.toFixed(
              1
            )}%</span></div>`;
        } else {
          const percent = totalPercentage[paramArray[0].dataIndex] || 0;
          if (percent > 0)
            tooltipContent += `<div style="display:flex; align-items:center; margin-top: 5px;">${
              paramArray[0].marker
            }<span style="margin-left:5px;">${statusFilter}: ${percent.toFixed(
              1
            )}%</span></div>`;
        }
        return tooltipContent;
      },
    },
    grid: {
      top: "10%",
      bottom: "5%",
      left: "5%",
      right: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData?.labels || [],
      axisLabel: { fontSize: 11, interval: 0 },
    },
    yAxis: {
      type: "value",
      max: yAxisMax > 100 ? 100 : yAxisMax,
      axisLabel: { formatter: "{value}%" },
    },
    series: [
      {
        name: chartData?.permanent.label || "Permanent",
        type: "bar",
        stack: "total",
        barWidth: "50%",
        data: statusFilter === "contract" ? [] : permanentPercentage,
        // ## 3. MAKE COLOR CONDITIONAL ##
        itemStyle: {
          color: statusFilter === "all" ? COLORS.total : COLORS.permanent,
        },
      },
      {
        name: chartData?.contract.label || "Contract",
        type: "bar",
        stack: "total",
        barWidth: "50%",
        data: statusFilter === "permanent" ? [] : contractPercentage,
        // ## 3. MAKE COLOR CONDITIONAL ##
        itemStyle: {
          color: statusFilter === "all" ? COLORS.total : COLORS.contract,
        },
      },
      {
        name: "Total",
        type: "bar",
        stack: "total",
        label: {
          show: true,
          position: "top",
          formatter: (params: { dataIndex: number }) => {
            const totalPercent = totalPercentage[params.dataIndex];
            return totalPercent > 0 ? `${totalPercent.toFixed(1)}%` : "";
          },
          color: "#4b5563",
          fontSize: 12,
        },
        data: totalValues.map(() => 0),
        itemStyle: { color: "transparent" },
        tooltip: { show: false },
      },
    ] as EChartsOption["series"],
  };

  const cardTitle =
    statusFilter === "all"
      ? "Education"
      : `Education (${
          statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
        })`;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="font-bold text-lg text-gray-800 mb-2">{cardTitle}</h3>
      <div className="flex-1">
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

export default EducationChartCard;
