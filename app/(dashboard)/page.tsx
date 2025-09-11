// File: app/(dashboard)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import ProductivitySection from "@/components/sections/ProductivitySection";
import EmployeeCostSection from "@/components/sections/EmployeeCostSection";
import DemographySection from "@/components/sections/DemographySection";
import type { DashboardData, GroupedChartData, RkapTargetData } from "@/types"; // <-- Pastikan RkapTargetData di-import

export default function DashboardPage() {
  const { selectedCompany, period, loading: isContextLoading } = useFilters();

  // State untuk data gabungan (Productivity & Employee Cost)
  const [metricsData, setMetricsData] = useState<DashboardData | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // State terpisah untuk data KPI Chart
  const [kpiData, setKpiData] = useState<GroupedChartData | null>(null);
  const [isLoadingKpi, setIsLoadingKpi] = useState(true);

  // --- 1. TAMBAHKAN STATE BARU UNTUK DATA RKAP ---
  const [rkapData, setRkapData] = useState<RkapTargetData | null>(null);
  const [isLoadingRkap, setIsLoadingRkap] = useState(true);

  // useEffect untuk data metrics (Productivity & Employee Cost cards)
  useEffect(() => {
    if (isContextLoading || selectedCompany === null) return;
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const params = new URLSearchParams({
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
    if (isContextLoading || selectedCompany === null) return;
    const fetchKpi = async () => {
      setIsLoadingKpi(true);
      try {
        const params = new URLSearchParams({ year: String(period.year) });
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
  }, [selectedCompany, period.year, isContextLoading]);

  // --- 2. TAMBAHKAN useEffect BARU UNTUK MENGAMBIL DATA RKAP ---
  useEffect(() => {
    if (isContextLoading || selectedCompany === null) return;

    const fetchRkap = async () => {
      setIsLoadingRkap(true);
      try {
        const params = new URLSearchParams({ year: String(period.year) });
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
  }, [selectedCompany, period.year, isContextLoading]);

  const overallLoading = isContextLoading || isLoadingMetrics;

  return (
    <div className="space-y-8">
      <ProductivitySection
        // --- 3. KIRIMKAN rkapData SEBAGAI PROP ---
        cardData={metricsData?.productivity ?? null}
        kpiData={kpiData}
        rkapData={rkapData} // <-- PROPERTI YANG HILANG SEKARANG SUDAH ADA
        loadingCards={overallLoading}
        loadingKpi={isLoadingKpi}
      />
      <EmployeeCostSection
        data={metricsData?.employeeCost}
        loading={overallLoading}
        rkapData={rkapData}
      />
      <DemographySection data={undefined} />
    </div>
  );
}
