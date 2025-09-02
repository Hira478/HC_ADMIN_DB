"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import SummaryCard from "@/components/ui/SummaryCard";
import WorkforcePlanningTable from "@/components/tables/WorkforcePlanningTable";
import TalentAcquisitionChart from "@/components/charts/TalentAcquisitionChart";
import TurnOverChart from "@/components/charts/TurnOverChart";
import type { TurnoverData } from "@/types";

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
    newHireRetention: number;
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

  const [turnoverData, setTurnoverData] = useState<TurnoverData | null>(null);
  const [loadingTurnover, setLoadingTurnover] = useState(true);

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

  useEffect(() => {
    if (!selectedCompany || !period) {
      setLoadingTurnover(false);
      return;
    }
    const fetchTurnoverData = async () => {
      setLoadingTurnover(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        value: String(period.value), // <-- 1. Tambahkan 'value' (bulan) ke parameter
      });
      try {
        const res = await fetch(`/api/turnover?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch turnover data");
        const result: TurnoverData = await res.json();
        setTurnoverData(result);
      } catch (error) {
        console.error(error);
        setTurnoverData(null);
      } finally {
        setLoadingTurnover(false);
      }
    };
    fetchTurnoverData();
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
          <div className="text-center p-10">Memuat data...</div>
        ) : !talentData ? (
          <div className="text-center p-10">Data tidak tersedia.</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gunakan optional chaining (?.) untuk keamanan */}
              <SummaryCard
                title="Total Hire"
                value={
                  talentData.cards?.totalHire?.toLocaleString("id-ID") ?? 0
                }
                unit="Employee"
                trend=""
              />
              <SummaryCard
                title="Total Cost Hire"
                value={Math.trunc(
                  talentData.cards.totalCostHire
                ).toLocaleString("id-ID")}
                unit="Juta"
                trend=""
              />
              <SummaryCard
                title="New Hire Retention"
                value={`${talentData.cards?.newHireRetention ?? 0}%`}
                trend=""
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TalentAcquisitionChart
                title="New Employee"
                subtitle={String(period.year)}
                chartData={talentData.charts?.newEmployee}
                isLoading={loadingTalent}
                yAxisUnitLabel="Employee"
              />
              <TalentAcquisitionChart
                title="Cost of Hire"
                subtitle={String(period.year)}
                chartData={talentData.charts?.costOfHire}
                isLoading={loadingTalent}
                yAxisUnitLabel="Million Rupiah"
              />
            </div>
          </div>
        )}
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Turn Over</h2>
        {/* Container ini sekarang full-width, tidak lagi dalam grid 2 kolom */}
        <div>
          <TurnOverChart data={turnoverData} isLoading={loadingTurnover} />
        </div>
      </div>
    </main>
  );
}
