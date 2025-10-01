// File: app/(dashboard)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import ProductivitySection from "@/components/sections/ProductivitySection";
import EmployeeCostSection from "@/components/sections/EmployeeCostSection";
import DemographySection from "@/components/sections/DemographySection";
import type {
  DashboardData,
  GroupedChartData,
  RkapTargetData,
  StackedChartData,
} from "@/types"; // <-- Pastikan RkapTargetData di-import
import { useAutoScrollPage } from "@/hooks/useAutoScrollPage";
import { Play, Pause } from "lucide-react";

export default function DashboardPage() {
  const { selectedCompany, period, loading: isContextLoading } = useFilters();
  const { isSlideshowMode } = useFilters();

  // State untuk data gabungan (Productivity & Employee Cost)
  const [metricsData, setMetricsData] = useState<DashboardData | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // State terpisah untuk data KPI Chart
  const [kpiData, setKpiData] = useState<GroupedChartData | null>(null);
  const [isLoadingKpi, setIsLoadingKpi] = useState(true);

  const [stackedChartData, setStackedChartData] =
    useState<StackedChartData | null>(null); // <-- UBAH INI
  const [isLoadingStackedChart, setIsLoadingStackedChart] = useState(true);

  // --- 1. TAMBAHKAN STATE BARU UNTUK DATA RKAP ---
  const [rkapData, setRkapData] = useState<RkapTargetData | null>(null);
  const [isLoadingRkap, setIsLoadingRkap] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useAutoScrollPage({
    speed: 0.5,
    pauseAtEdge: 3000,
    enabled: isSlideshowMode && isAutoScrolling,
  });

  // useEffect untuk data metrics (Productivity & Employee Cost cards)
  useEffect(() => {
    if (isContextLoading || selectedCompany === null) return;
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const params = new URLSearchParams({
          // --- PASTIKAN companyId DIKIRIM ---
          companyId: String(selectedCompany),
          year: String(period.year),
          month: String(period.value),
        });
        const response = await fetch(
          `/api/productivity/metrics?${params.toString()}`
        );
        if (!response.ok) throw new Error("Metrics data not found");
        setMetricsData(await response.json());
      } catch (error) {
        console.error("Fetch error on metrics:", error);
        setMetricsData(null);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, [selectedCompany, period, isContextLoading]);

  // useEffect untuk data KPI Chart
  useEffect(() => {
    // Gunakan period.value untuk bulan
    if (isContextLoading || selectedCompany === null || !period.value) return;

    const fetchKpi = async () => {
      setIsLoadingKpi(true);
      try {
        // Tambahkan 'month' ke dalam parameter
        const params = new URLSearchParams({
          // --- PERBAIKAN DI SINI ---
          companyId: String(selectedCompany), // <-- SELALU KIRIM companyId
          year: String(period.year),
          month: String(period.value),
        });
        const response = await fetch(
          `/api/charts/kpi-performance?${params.toString()}`
        );
        if (!response.ok) throw new Error("KPI data not found");
        setKpiData(await response.json());
      } catch (error) {
        console.error("Fetch error on KPI:", error);
        setKpiData(null);
      } finally {
        setIsLoadingKpi(false);
      }
    };
    fetchKpi();
  }, [selectedCompany, period, isContextLoading]); // <-- Ubah dependensi menjadi 'period' utuh

  // --- 2. TAMBAHKAN useEffect BARU UNTUK MENGAMBIL DATA RKAP ---
  useEffect(() => {
    if (isContextLoading || selectedCompany === null) return;

    const fetchRkap = async () => {
      setIsLoadingRkap(true);
      try {
        const params = new URLSearchParams({
          // --- PERBAIKAN DI SINI ---
          companyId: String(selectedCompany), // <-- SELALU KIRIM companyId
          year: String(period.year),
          month: String(period.value),
        });
        const response = await fetch(`/api/rkap/targets?${params.toString()}`);
        if (!response.ok) throw new Error("RKAP data not found");
        setRkapData(await response.json());
      } catch (error) {
        console.error("Fetch error on RKAP:", error);
        setRkapData(null);
      } finally {
        setIsLoadingRkap(false);
      }
    };
    fetchRkap();
  }, [selectedCompany, period, isContextLoading]);

  // --- TAMBAHKAN useEffect BARU UNTUK MENGAMBIL DATA CHART BARU ---
  useEffect(() => {
    if (isContextLoading || selectedCompany === null) return;
    const fetchStackedChartData = async () => {
      setIsLoadingStackedChart(true);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
          year: String(period.year),
        });
        const response = await fetch(
          `/api/charts/employee-cost-breakdown?${params.toString()}`
        );
        if (!response.ok) throw new Error("Stacked chart data not found");
        setStackedChartData(await response.json());
      } catch (error) {
        console.error("Fetch error on stacked chart:", error);
        setStackedChartData(null);
      } finally {
        setIsLoadingStackedChart(false);
      }
    };
    fetchStackedChartData();
  }, [selectedCompany, period.year, isContextLoading]);

  const overallLoading = isContextLoading || isLoadingMetrics;

  return (
    <>
      {" "}
      {/* Gunakan Fragment agar bisa menampung tombol di luar main div */}
      <div className="space-y-8">
        <ProductivitySection
          cardData={metricsData?.productivity ?? null}
          kpiData={kpiData}
          rkapData={rkapData}
          loadingCards={overallLoading}
          loadingKpi={isLoadingKpi}
        />
        <EmployeeCostSection
          data={metricsData?.employeeCost}
          loading={overallLoading}
          rkapData={rkapData}
          stackedChartData={stackedChartData}
          loadingStackedChart={isLoadingStackedChart}
        />
        <DemographySection data={undefined} />
      </div>
      {/* --- 4. TAMBAHKAN TOMBOL ON/OFF DI SINI --- */}
      {isSlideshowMode && (
        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className="fixed bottom-6 right-6 z-50 ..."
          title={isAutoScrolling ? "Pause Scroll" : "Resume Scroll"}
        >
          {isAutoScrolling ? <Pause size={20} /> : <Play size={20} />}
        </button>
      )}
    </>
  );
}
