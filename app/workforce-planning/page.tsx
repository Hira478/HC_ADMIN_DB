"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import SummaryCard from "@/components/ui/SummaryCard";
import WorkforcePlanningTable from "@/components/tables/WorkforcePlanningTable";
import StatCard from "@/components/widgets/StatCard";
import TalentAcquisitionChart from "@/components/charts/TalentAcquisitionChart";

// --- Tipe Data untuk Section 1 ---
interface WorkforceTableRow {
  division: string;
  manPowerPlanning: number;
  headcount: number;
  rasio: string;
  status: "Stretch" | "Fit" | "Overload";
}
interface WorkforceData {
  summary: {
    totalManpowerPlanning: { value: number; trend: string };
    totalHeadcount: { value: number; trend: string };
    fulfilment: { value: string };
  };
  table: {
    data: WorkforceTableRow[];
    meta: { currentPage: number; totalPages: number };
  };
}

// --- Tipe Data untuk Section 2 ---
interface TalentData {
  cards: {
    totalHire: number;
    totalCostHire: number;
  };
  charts: {
    newEmployee: { categories: string[]; data: number[] };
    costOfHire: { categories: string[]; data: number[] };
  };
}

export default function WorkforcePlanningPage() {
  const { selectedCompany, period } = useFilters();

  // --- State untuk Section 1 ---
  const [workforceData, setWorkforceData] = useState<WorkforceData | null>(
    null
  );
  const [loadingWorkforce, setLoadingWorkforce] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // --- State untuk Section 2 ---
  const [talentData, setTalentData] = useState<TalentData | null>(null);
  const [loadingTalent, setLoadingTalent] = useState(true);

  // --- useEffect untuk Section 1 ---
  useEffect(() => {
    if (selectedCompany && period.year && period.value) {
      setLoadingWorkforce(true);
      const fetchData = async () => {
        const url = `/api/workforce/planning?companyId=${selectedCompany}&year=${period.year}&month=${period.value}&page=${currentPage}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch workforce data");
          const result: WorkforceData = await res.json();
          setWorkforceData(result);
        } catch (error) {
          console.error(error);
          setWorkforceData(null);
        } finally {
          setLoadingWorkforce(false);
        }
      };
      fetchData();
    }
  }, [selectedCompany, period.year, period.value, currentPage]);

  // --- useEffect untuk Section 2 ---
  useEffect(() => {
    if (!selectedCompany || !period) {
      setLoadingTalent(false);
      return;
    }
    const fetchTalentData = async () => {
      setLoadingTalent(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        value: String(period.value),
      });
      try {
        const res = await fetch(`/api/talent-acquisition?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch talent data");
        const result: TalentData = await res.json();
        setTalentData(result);
      } catch (error) {
        console.error(error);
        setTalentData(null);
      } finally {
        setLoadingTalent(false);
      }
    };
    fetchTalentData();
  }, [selectedCompany, period]);

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Workforce Planning
      </h1>

      {/* --- SECTION 1: Manpower Planning vs Headcount --- */}
      {loadingWorkforce ? (
        <div className="text-center p-10">Memuat data Manpower Planning...</div>
      ) : !workforceData ? (
        <div className="text-center p-10">
          Data Manpower Planning tidak tersedia.
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <SummaryCard
              title="Total Manpower Planning"
              value={workforceData.summary.totalManpowerPlanning.value.toLocaleString(
                "id-ID"
              )}
              unit="Employee"
              trend={workforceData.summary.totalManpowerPlanning.trend}
            />
            <SummaryCard
              title="Total Headcount"
              value={workforceData.summary.totalHeadcount.value.toLocaleString(
                "id-ID"
              )}
              unit="Employee"
              trend={workforceData.summary.totalHeadcount.trend}
            />
            <SummaryCard
              title="Fulfilment"
              value={workforceData.summary.fulfilment.value}
            />
          </div>
          <WorkforcePlanningTable
            data={workforceData.table.data}
            meta={workforceData.table.meta}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* --- SECTION 2: Talent Acquisition --- */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Talent Acquisition
        </h2>
        {loadingTalent ? (
          <div className="text-center p-10">
            Memuat data Talent Acquisition...
          </div>
        ) : !talentData ? (
          <div className="text-center p-10">
            Data Talent Acquisition tidak tersedia.
          </div>
        ) : (
          // --- PERUBAHAN UTAMA LAYOUT DI SINI ---
          // Kita gunakan grid 2 kolom
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 1. Kolom kartu dibuat lebih lebar (col-span-4) dan mengisi tinggi (h-full) */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
              <StatCard
                title="Total Hire"
                value={talentData.cards.totalHire.toLocaleString("id-ID")}
                valueUnit="Employee"
                variant="dark"
                change=""
                rkdapInfo="Total Hire"
                className="flex-1" // <-- 2. Tambahkan flex-1 agar kartu mengisi ruang
              />
              <StatCard
                title="Total Cost Hire"
                value={talentData.cards.totalCostHire.toLocaleString("id-ID")}
                valueUnit="Juta"
                variant="dark"
                change=""
                rkdapInfo="Total Cost Hire"
                className="flex-1" // <-- 2. Tambahkan flex-1 agar kartu mengisi ruang
              />
            </div>

            {/* Kolom Kanan: Charts disesuaikan lebarnya */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full">
              <TalentAcquisitionChart
                title="New Employee"
                subtitle={String(period.year)}
                chartData={talentData.charts.newEmployee}
                isLoading={loadingTalent}
                yAxisUnitLabel="Karyawan"
              />
              <TalentAcquisitionChart
                title="Cost of Hire"
                subtitle={String(period.year)}
                chartData={talentData.charts.costOfHire}
                isLoading={loadingTalent}
                yAxisUnitLabel="dalam juta rupiah"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
