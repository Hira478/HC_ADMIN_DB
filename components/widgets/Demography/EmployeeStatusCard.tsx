"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";
import { EChartsOption } from "echarts";
import { XCircle } from "lucide-react";

interface HeadcountApiData {
  total: number;
  permanent: { total: number; male: number; female: number };
  contract: { total: number; male: number; female: number };
  change?: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  Permanent: "#1e3a8a",
  Contract: "#0d9488",
  default: "#9ca3af",
};

const EmployeeStatusCard = () => {
  // ## PERUBAHAN 1: Ambil statusFilter dan setStatusFilter dari context ##
  const { selectedCompany, period, statusFilter, setStatusFilter } =
    useFilters();
  const [data, setData] = useState<HeadcountApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (logika fetch data tetap sama)
    if (selectedCompany === null || !period) {
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
        });
        const response = await fetch(
          `/api/demography/headcount?${params.toString()}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const apiData: HeadcountApiData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error("Fetch error for status chart:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  // ## PERUBAHAN 2: Buat handler untuk event klik ##
  const handleChartClick = (params: { name: string }) => {
    const newFilter = params.name.toLowerCase() as "permanent" | "contract";
    // Jika mengklik filter yang sudah aktif, reset ke 'all'. Jika tidak, set filter baru.
    if (statusFilter === newFilter) {
      setStatusFilter("all");
    } else {
      setStatusFilter(newFilter);
    }
  };

  const onEvents = {
    click: handleChartClick,
  };

  const chartDataForPie = data
    ? [
        { name: "Permanent", value: data.permanent.total },
        { name: "Contract", value: data.contract.total },
      ]
    : [];

  const option: EChartsOption = {
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: { show: false },
    series: [
      {
        name: "Employee Status",
        type: "pie",
        radius: ["40%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 5 },
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%",
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold",
        },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 8 },
        // ## PERUBAHAN 3: Tambahkan umpan balik visual pada chart ##
        selectedMode: "single", // Izinkan hanya satu segmen yang 'terpilih'
        data: chartDataForPie.map((item) => ({
          ...item,
          // Set 'selected' jika nama item cocok dengan filter global
          selected: statusFilter === item.name.toLowerCase(),
          itemStyle: {
            color: STATUS_COLORS[item.name] || STATUS_COLORS.default,
          },
        })),
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-xl text-gray-800">Employee Status</h3>
        {/* ## PERUBAHAN 4: Tambahkan tombol reset filter ## */}
        {statusFilter !== "all" && (
          <button
            onClick={() => setStatusFilter("all")}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <XCircle size={14} />
            Reset Filter
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {/* ## PERUBAHAN 5: Hubungkan event handler ke chart ## */}
        <ReactECharts
          option={option}
          onEvents={onEvents}
          style={{ height: "100%", width: "100%", minHeight: "250px" }}
        />
      </div>
      <div className="flex justify-center gap-6 mt-2 border-t pt-4">
        {chartDataForPie.map((item) => {
          const isActive = statusFilter === item.name.toLowerCase();
          return (
            <div
              key={item.name}
              className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                isActive ? "bg-gray-100" : ""
              }`}
              onClick={() => handleChartClick({ name: item.name })}
            >
              <div className="flex items-center">
                <span
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: STATUS_COLORS[item.name] }}
                ></span>
                {/* ## PERUBAHAN 6: Umpan balik visual pada legenda kustom ## */}
                <span
                  className={`text-sm ${
                    isActive
                      ? "font-bold text-gray-800"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <span
                className={`text-lg font-bold ${
                  isActive ? "text-gray-900" : "text-gray-800"
                }`}
              >
                {item.value.toLocaleString("id-ID")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeStatusCard;
