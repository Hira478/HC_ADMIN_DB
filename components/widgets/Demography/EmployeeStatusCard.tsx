"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface StatusData {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

const EmployeeStatusCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          `/api/demography/status?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Fetch error for status chart:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: { show: false },
    series: [
      {
        name: "Employee Status",
        type: "pie",
        radius: ["30%", "85%"],
        center: ["50%", "55%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 11,
          borderColor: "#fff",
          borderWidth: 7,
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{b}\n{c}", // tampilkan jumlah
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold",
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 18,
            fontWeight: "bold",
          },
        },
        data: chartData.map((item) => ({
          ...item,
          itemStyle: {
            color: item.name === "Permanent" ? "#C53030" : "#4A5568",
          },
        })),
      },
    ],
  };

  if (loading && chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="font-bold text-xl text-gray-800 mb-2">Employee Status</h3>

      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center translate-y-[60px]">
          <span className="h-4 w-4 rounded-full bg-red-700 mr-2"></span>
          <span className="text-base font-medium">Permanent</span>
        </div>
        <div className="flex items-center translate-y-[60px]">
          <span className="h-4 w-4 rounded-full bg-gray-700 mr-2"></span>
          <span className="text-base font-medium">Contract</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center -mt-2">
        <ReactECharts
          option={option}
          style={{
            height: "320px",
            width: "100%",
          }}
        />
      </div>

      <div className="text-base text-gray-600 -mt-3 text-center space-y-1 transform -translate-y-1">
        {" "}
        {/* Added -translate-y-1 */}
        <p className="font-medium">
          Permanent: <span className="text-green-600">+2%</span> | Year on Year
        </p>
        <p className="font-medium">
          Contract: <span className="text-green-600">+2%</span> | Year on Year
        </p>
      </div>
    </div>
  );
};

export default EmployeeStatusCard;
