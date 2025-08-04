"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

interface StatusData {
  name: string;
  value: number;
}

const EmployeeStatusCard = () => {
  const { selectedCompany, period } = useFilters();
  const [chartData, setChartData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompany || !period) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          companyId: selectedCompany,
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

  const totalEmployees = chartData.reduce((sum, item) => sum + item.value, 0);

  const option = {
    tooltip: { trigger: "item" },
    series: [
      {
        name: "Employee Status",
        type: "pie",
        radius: ["60%", "80%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "center",
          formatter: () => {
            if (loading || totalEmployees === 0) return "";
            return `${totalEmployees}`;
          },
          fontSize: 24,
          fontWeight: "bold",
          color: "#1f2937",
        },
        emphasis: { label: { show: true } },
        data: chartData,
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
      <h3 className="font-bold text-lg text-gray-800">Employee Status</h3>
      <div className="flex space-x-4 text-xs text-gray-600 my-2">
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-700 mr-2"></span>
          Permanent
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-gray-700 mr-2"></span>
          Contract
        </div>
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
      <div className="text-center text-sm text-gray-500 mt-auto pt-2">
        <p>Permanent : +2% | Year on Year</p>
        <p>Contract : +2% | Year on Year</p>
      </div>
    </div>
  );
};

export default EmployeeStatusCard;
