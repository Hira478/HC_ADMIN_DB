"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import SummaryCard from "@/components/ui/SummaryCard";
import WorkforcePlanningTable from "@/components/tables/WorkforcePlanningTable";

// 1. Buat interface spesifik untuk baris tabel
interface WorkforceTableRow {
  division: string;
  manPowerPlanning: number;
  headcount: number;
  rasio: string;
  status: "Stretch" | "Fit" | "Overload";
}

// 2. Buat interface untuk seluruh data halaman
interface WorkforceData {
  summary: {
    totalManpowerPlanning: { value: number; trend: string };
    totalHeadcount: { value: number; trend: string };
    fulfilment: { value: string };
  };
  table: {
    // 3. Gunakan interface yang baru, bukan `any[]`
    data: WorkforceTableRow[];
    meta: { currentPage: number; totalPages: number };
  };
}

export default function WorkforcePlanningPage() {
  const { selectedCompany, period } = useFilters();
  const [data, setData] = useState<WorkforceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (selectedCompany && period.year && period.value) {
      setIsLoading(true);
      const fetchData = async () => {
        const url = `/api/workforce/planning?companyId=${selectedCompany}&year=${period.year}&month=${period.value}&page=${currentPage}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch");
          const result: WorkforceData = await res.json(); // Terapkan tipe di sini
          setData(result);
        } catch (error) {
          console.error(error);
          setData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedCompany, period.year, period.value, currentPage]);

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Workforce Planning
      </h1>

      {isLoading ? (
        <div className="text-center p-10">Memuat data...</div>
      ) : !data ? (
        <div className="text-center p-10">
          Data tidak tersedia untuk filter yang dipilih.
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <SummaryCard
              title="Total Manpower Planning"
              value={data.summary.totalManpowerPlanning.value.toLocaleString(
                "id-ID"
              )}
              unit="Employee"
              trend={data.summary.totalManpowerPlanning.trend}
            />
            <SummaryCard
              title="Total Headcount"
              value={data.summary.totalHeadcount.value.toLocaleString("id-ID")}
              unit="Employee"
              trend={data.summary.totalHeadcount.trend}
            />
            <SummaryCard
              title="Fulfilment"
              value={data.summary.fulfilment.value}
            />
          </div>

          <WorkforcePlanningTable
            data={data.table.data}
            meta={data.table.meta}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </main>
  );
}
