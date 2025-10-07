"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import { EChartsOption } from "echarts";

interface AgeApiData {
  labels: string[];
  permanent: { label: string; values: number[] };
  contract: { label: string; values: number[] };
  total: { label: string; values: number[] };
}

// ## 1. TAMBAHKAN WARNA 'TOTAL' ##
const COLORS = {
  permanent: "#16a34a", // Hijau gelap
  contract: "#86efac", // Hijau terang
  total: "#15803d", // Warna solid untuk mode 'all'
};

const AgeChartCard = () => {
  const { selectedCompany, period, statusFilter } = useFilters();
  const [chartData, setChartData] = useState<AgeApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... Logika fetchData tidak berubah ...
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
          `/api/demography/age?${params.toString()}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: AgeApiData = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Fetch error for Age Chart:", error);
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

  // ... (Logika kalkulasi percentage tidak berubah) ...
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
  const xAxisMax = Math.ceil(Math.max(...totalPercentage, 0) / 10) * 10 + 10;

  const option: EChartsOption = {
    grid: {
      left: "5%",
      right: "5%",
      top: "5%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: xAxisMax > 100 ? 100 : xAxisMax,
      axisLabel: { formatter: "{value}%" },
    },
    yAxis: { type: "category", data: chartData?.labels || [] },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // ## 2. PERBARUI LOGIKA TOOLTIP ##
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
    series: [
      {
        name: chartData?.permanent.label || "Permanent",
        type: "bar",
        stack: "total",
        barWidth: "45%",
        data: statusFilter === "contract" ? [] : permanentPercentage,
        // ## 3. BUAT WARNA KONDISIONAL ##
        itemStyle: {
          color: statusFilter === "all" ? COLORS.total : COLORS.permanent,
        },
      },
      {
        name: chartData?.contract.label || "Contract",
        type: "bar",
        stack: "total",
        barWidth: "45%",
        data: statusFilter === "permanent" ? [] : contractPercentage,
        // ## 3. BUAT WARNA KONDISIONAL ##
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
      ? "Age"
      : `Age (${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})`;

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-bold text-lg text-gray-800">{cardTitle}</h3>
      </div>
      <div className="flex-1 -ml-1.5">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%", minHeight: "250px" }}
        />
      </div>
    </div>
  );
};

export default AgeChartCard;
