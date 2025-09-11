"use client";
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useFilters } from "@/contexts/FilterContext";

// 1. Definisikan tipe data yang lebih lengkap sesuai respons API
interface StatusData {
  name: string;
  value: number;
}
interface EmployeeStatusState {
  chartData: StatusData[];
  yoy: {
    permanent: string;
    contract: string;
  };
}

const EmployeeStatusCard = () => {
  const { selectedCompany, period } = useFilters();
  // 2. Gunakan state baru yang bisa menampung chartData dan yoy
  const [data, setData] = useState<EmployeeStatusState | null>(null);
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
        // 3. Simpan seluruh objek respons dari API ke dalam state
        const apiData: EmployeeStatusState = await response.json();
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
          formatter: "{b}\n{c}",
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold",
          textBorderColor: "#000",
          textBorderWidth: 2,
          textBorderType: "solid",
          textShadowColor: "rgba(0,0,0,0.5)",
          textShadowBlur: 2,
          textShadowOffsetX: 1,
          textShadowOffsetY: 1,
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
            textBorderColor: "#000",
            textBorderWidth: 2,
            textBorderType: "solid",
          },
        },
        // 4. Arahkan sumber data chart ke `data.chartData`
        data: (data?.chartData || []).map((item) => ({
          ...item,
          itemStyle: {
            color: item.name === "Permanent" ? "#C53030" : "#4A5568",
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

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        No Data.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="font-bold text-xl text-gray-800 mb-2">Employee Status</h3>

      {/* Tampilan legenda kustom Anda tetap sama */}
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

      {/* Tampilan chart Anda tetap sama */}
      <div className="flex-1 flex items-center justify-center -mt-2">
        <ReactECharts
          option={option}
          style={{
            height: "320px",
            width: "100%",
          }}
        />
      </div>

      {/* 5. Ganti teks statis dengan data YoY yang dinamis */}
      <div className="text-base text-gray-600 -mt-3 text-center space-y-1 transform -translate-y-1">
        <p className="font-medium">
          Permanent:{" "}
          <span className="text-green-600">{data.yoy.permanent}</span>
        </p>
        <p className="font-medium">
          Contract: <span className="text-green-600">{data.yoy.contract}</span>
        </p>
      </div>
    </div>
  );
};

export default EmployeeStatusCard;
