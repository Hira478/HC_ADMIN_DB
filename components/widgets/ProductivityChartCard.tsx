// File: components/widgets/ProductivityChartCard.tsx

"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import CardLoader from "./CardLoader";

// Interface untuk data chart (tetap sama)
interface ProductivityChartData {
  months: string[];
  revenue: number[];
  netProfit: number[];
  revenuePerEmployee: number[];
  netProfitPerEmployee: number[];
}

// 1. BUAT KOMPONEN BARU UNTUK CHART GABUNGAN (BAR & LINE)
const CombinedChart = ({
  title,
  months,
  barData,
  barName,
  lineData,
  lineName,
}: {
  title: string;
  months: string[];
  barData: number[];
  barName: string;
  lineData: number[];
  lineName: string;
}) => {
  // Fungsi formatter untuk sumbu Y (tetap sama)

  const numberFormatter = (value: number | { value: number }) => {
    // ECharts bisa mengirim objek atau angka, ekstrak nilainya
    const num =
      typeof value === "object" && value !== null ? value.value : value;

    // Pastikan itu angka sebelum memformat
    if (typeof num !== "number" || isNaN(num)) {
      return value;
    }
    // Format ke string dengan pemisah titik ribuan (standar Indonesia)
    return num.toLocaleString("id-ID");
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      // Gunakan 'formatter' untuk kontrol penuh atas konten tooltip
      formatter: (
        params: {
          axisValue: string;
          marker: string;
          seriesName: string;
          value: number;
        }[]
      ) => {
        // Ambil nama bulan dari data point pertama
        let tooltipText = `${params[0].axisValue}<br/>`;

        // Loop melalui setiap seri data (bar dan line)
        params.forEach((param) => {
          const marker = param.marker; // Indikator warna (bulat/kotak)
          const seriesName = param.seriesName;
          const value = param.value;
          // Gunakan numberFormatter kita yang sudah andal
          const formattedValue = numberFormatter(value);

          tooltipText += `${marker} ${seriesName}: <strong>${formattedValue}</strong><br/>`;
        });

        return tooltipText;
      },
    },
    legend: {
      data: [barName, lineName],
      top: "10%", // Posisikan legend di bawah judul
    },
    xAxis: {
      type: "category",
      data: months,
    },
    // Konfigurasi DUA sumbu Y
    yAxis: [
      {
        // Sumbu Y Kiri untuk Bar Chart (Revenue/Net Profit)
        type: "value",
        name: barName,
        position: "left",
        alignTicks: true,
        axisLabel: {
          // 2. Terapkan formatter baru di sini
          formatter: numberFormatter, // DIUBAH
        },
      },
      {
        // Sumbu Y Kanan untuk Line Chart (Revenue/Employee)
        type: "value",
        name: lineName,
        position: "right",
        alignTicks: true,
        min: "dataMin",
        axisLabel: {
          // 3. Terapkan formatter baru di sini juga
          formatter: numberFormatter, // DIUBAH
        },
      },
    ],
    series: [
      {
        name: barName,
        type: "bar",
        yAxisIndex: 0,
        data: barData,
        itemStyle: {
          opacity: 0.85,
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#EA0000" }, // Warna atas
              { offset: 1, color: "#AD0000" }, // Warna bawah
            ],
          },
        }, // 2. Tambahkan label di dalam bar
      },
      {
        name: lineName,
        type: "line",
        yAxisIndex: 1,
        smooth: false,
        data: lineData,
        itemStyle: {
          color: "#156082",
        },
        // 3. Tambahkan label di atas garis
      },
    ],
    grid: {
      left: "3%",
      right: "4%", // Beri ruang lebih untuk label sumbu Y kanan
      bottom: "3%",
      top: "20%", // Beri ruang di atas untuk judul dan legend
      containLabel: true,
    },
    title: {
      text: title,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
  };

  return (
    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-200 h-[350px]">
      {" "}
      {/* Tinggi card ditambah */}
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

const ProductivityChartCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<ProductivityChartData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Logika fetch data tidak berubah
  useEffect(() => {
    if (!selectedCompany || !period) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
      });
      try {
        const response = await fetch(
          `/api/charts/productivity?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const data: ProductivityChartData = await response.json();
        setChartData(data);
      } catch {
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  if (loading) return <CardLoader />;
  if (!chartData)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
        No Data.
      </div>
    );

  // 2. UBAH TAMPILAN UNTUK MERENDER DUA CHART GABUNGAN
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          Productivity Analysis {period.year}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Chart Pertama: Revenue & Revenue/Employee */}
        <CombinedChart
          title="Revenue & Revenue/Employee"
          months={chartData.months}
          barData={chartData.revenue}
          barName="Revenue"
          lineData={chartData.revenuePerEmployee}
          lineName="Revenue/Employee"
        />

        {/* Chart Kedua: Net Profit & Net Profit/Employee */}
        <CombinedChart
          title="Net Profit & Net Profit/Employee"
          months={chartData.months}
          barData={chartData.netProfit}
          barName="Net Profit"
          lineData={chartData.netProfitPerEmployee}
          lineName="Net Profit/Employee"
        />
      </div>
    </div>
  );
};

export default ProductivityChartCard;
