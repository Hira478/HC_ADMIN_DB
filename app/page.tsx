"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import ProductivitySection from "@/components/sections/ProductivitySection";
import EmployeeCostSection from "@/components/sections/EmployeeCostSection";
import DemographySection from "@/components/sections/DemographySection";
import type { DashboardData } from "@/types";

export default function DashboardPage() {
  const { selectedCompany, period } = useFilters();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany === null || !period) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setData(null);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
          type: period.type,
          year: String(period.year),
          value: String(period.value),
        });
        const response = await fetch(
          `/api/productivity/metrics?${params.toString()}`
        );
        if (!response.ok) throw new Error("Data not found");
        const apiData = await response.json();
        setData(apiData);
      } catch (error) {
        console.error("Fetch error on main page:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  return (
    <div className="space-y-8">
      <ProductivitySection data={data?.productivity} loading={loading} />
      <EmployeeCostSection data={data?.employeeCost} loading={loading} />
      <DemographySection data={data?.demography} />
    </div>
  );
}
