"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import { getSymbolSize } from "echarts/types/src/chart/graph/graphHelper.js";

interface ProductivityChartData {
  months: string[];
  revenue: number[];
  netProfit: number[];
  revenuePerEmployee: number[];
  netProfitPerEmployee: number[];
}

interface EChartsTooltipParams {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | { value: number };
}

// --- PERUBAHAN 1: 'CombinedChart' sekarang menjadi komponen KARTU LENGKAP ---
const CombinedChart = ({
  title,
  unitText, // Prop baru untuk teks unit
  months,
  barData,
  barName,
  lineData,
  lineName,
}: {
  title: string;
  unitText: string;
  months: string[];
  barData: number[];
  barName: string;
  lineData: number[];
  lineName: string;
}) => {
  const numberFormatter = (value: unknown) => {
    let numToFormat: number;

    // Cek dulu apakah value adalah angka
    if (typeof value === "number") {
      numToFormat = value;
    }
    // Jika bukan, cek apakah ia objek yang punya properti 'value' berupa angka
    else if (
      typeof value === "object" &&
      value !== null &&
      "value" in value &&
      typeof (value as { value: unknown }).value === "number"
    ) {
      numToFormat = (value as { value: number }).value;
    }
    // Jika tidak keduanya, kembalikan nilai asli
    else {
      return value;
    }

    if (isNaN(numToFormat)) return value;

    return Math.round(numToFormat).toLocaleString("id-ID");
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params: EChartsTooltipParams[]) => {
        let tooltipText = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          tooltipText += `${param.marker} ${
            param.seriesName
          }: <strong>${numberFormatter(param.value)}</strong><br/>`;
        });
        return tooltipText;
      },
    },
    legend: {
      data: [barName, lineName],
      top: "5%", // Jarak legend dari atas
    },
    xAxis: { type: "category", data: months },
    yAxis: [
      {
        type: "value",
        name: barName,
        position: "left",
        alignTicks: true,
        axisLabel: { formatter: numberFormatter },
      },
      {
        type: "value",
        name: lineName,
        position: "right",
        alignTicks: true,
        axisLabel: { formatter: numberFormatter },
      },
    ],
    series: [
      {
        name: barName,
        type: "bar",
        yAxisIndex: 0,
        data: barData,
        itemStyle: {
          color: "rgba(0, 74, 128, 0.75)",
        },
      },
      {
        name: lineName,
        type: "line",
        yAxisIndex: 1,
        smooth: false,
        data: lineData,
        itemStyle: { color: "#00A9B5" },
        symbolSize: 8,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0, 169, 181, 0.3)" }, // Warna atas (teal transparan)
              { offset: 1, color: "rgba(0, 169, 181, 0.3)" }, // Warna bawah (sepenuhnya transparan)
            ],
          },
        },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "18%",
      containLabel: true,
    },
    // PERUBAHAN 2: Hapus 'title' dari ECharts, karena sudah ada di header JSX
  };

  return (
    // PERUBAHAN 3: Struktur baru untuk kartu chart
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header baru untuk judul dan unit */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="border border-gray-200 rounded-md px-2 py-1">
          <p className="text-xs font-semibold text-gray-500">{unitText}</p>
        </div>
      </div>
      {/* Kontainer untuk chart itu sendiri */}
      <div className="h-[350px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
};

// --- Komponen Utama ---
const ProductivityChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ProductivityChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period || !period.value) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        month: String(period.value),
      });
      try {
        const response = await fetch(
          `/api/charts/productivity?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data = await response.json();
        setChartData(data);
      } catch {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  // PERUBAHAN 4: Skeleton loader sekarang untuk dua kartu terpisah
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gray-200 rounded-lg shadow-md h-[420px] w-full animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg shadow-md h-[420px] w-full animate-pulse"></div>
      </div>
    );
  }
  if (!chartData) {
    return (
      <div className="p-6 bg-yellow-100 text-yellow-800 rounded-lg text-center">
        No Productivity Chart Data Available.
      </div>
    );
  }

  // PERUBAHAN 5: Tampilan utama sekarang hanya menumpuk dua 'CombinedChart'
  return (
    <div className="grid grid-cols-1 gap-6">
      <CombinedChart
        title="Revenue & Revenue/Employee"
        unitText="Unit: Million"
        months={chartData.months}
        barData={chartData.revenue}
        barName="Revenue"
        lineData={chartData.revenuePerEmployee}
        lineName="Revenue/Employee"
      />
      <CombinedChart
        title="Net Profit & Net Profit/Employee"
        unitText="Unit: Million"
        months={chartData.months}
        barData={chartData.netProfit}
        barName="Net Profit"
        lineData={chartData.netProfitPerEmployee}
        lineName="Net Profit/Employee"
      />
    </div>
  );
};

export default ProductivityChartCard;
