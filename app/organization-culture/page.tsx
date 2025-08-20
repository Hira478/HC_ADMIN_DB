// app/organization-culture/page.tsx
"use client";
import AreaLineChart from "@/components/charts/AreaLineChart";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import OrganizationHealthChart from "@/components/charts/OrganizationHealthChart";
import InfoCard from "@/components/ui/InfoCard";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
// import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";
import { CultureMaturityData } from "@/app/api/charts/culture-maturity/route";

interface SimpleChartData {
  categories: string[];
  data: number[];
}

export default function OrganizationCulturePage() {
  const { selectedCompany, period } = useFilters(); // <-- Ambil filter dari context
  //const [healthData, setHealthData] = useState<OrganizationHealthData | null>(
  //  null
  //);
  //const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const [maturityData, setMaturityData] = useState<SimpleChartData | null>(
    null
  );
  const [isLoadingMaturity, setIsLoadingMaturity] = useState(true);
  const [cultureData, setCultureData] = useState<CultureMaturityData | null>(
    null
  );
  const [isLoadingCulture, setIsLoadingCulture] = useState(true);

  const formationRatioData = {
    categories: [
      "Risiko & Tata Kelola",
      "SDM & Umum",
      "Keuangan",
      "IT",
      "Operasional",
      "Bisnis",
      "Cabang",
    ],
    data: [10, 11, 12, 12, 15, 18, 22],
  };

  const employeeEngagementData: CultureMaturityData = {
    title: "Employee Engagement",
    mainScore: "78.5",
    scoreLabel: "Moderate High",
    trend: "+10% | Year on Year",
    chartData: {
      categories: ["Say", "Stay", "Strive"],
      seriesPrevYear: [74, 72, 75],
      seriesCurrYear: [77, 70, 80],
    },
    prevYear: 2024, // Contoh
    currYear: 2025, // Contoh
  };

  // --- PERUBAHAN FINAL DI SINI ---
  // Membuat "deep copy" sederhana untuk memastikan tidak ada referensi array yang sama.

  //useEffect(() => {
  //if (selectedCompany && period.year) {
  //setIsLoadingHealth(true);
  //const fetchData = async () => {
  //try {
  //const res = await fetch(
  //`/api/charts/organization-health?companyId=${selectedCompany}&year=${period.year}`
  //);
  //if (!res.ok) throw new Error("Failed to fetch");
  //const data: OrganizationHealthData = await res.json();
  //setHealthData(data);
  //} catch (error) {
  //console.error(error);
  //setHealthData(null); // Reset data jika ada error
  //} finally {
  //setIsLoadingHealth(false);
  //}
  //};
  //fetchData();
  //} else {
  //setHealthData(null);
  //setIsLoadingHealth(false);
  //}
  //}, [selectedCompany, period.year]);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingMaturity(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/hc-maturity?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch maturity data");
          const data: SimpleChartData = await res.json();
          setMaturityData(data);
        } catch (error) {
          console.error(error);
          setMaturityData(null);
        } finally {
          setIsLoadingMaturity(false);
        }
      };
      fetchData();
    } else {
      setMaturityData(null);
      setIsLoadingMaturity(false);
    }
  }, [selectedCompany, period.year]);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingCulture(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/culture-maturity?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch culture data");
          const data: CultureMaturityData = await res.json();
          setCultureData(data);
        } catch (error) {
          console.error(error);
          setCultureData(null);
        } finally {
          setIsLoadingCulture(false);
        }
      };
      fetchData();
    } else {
      setCultureData(null);
      setIsLoadingCulture(false);
    }
  }, [selectedCompany, period.year]);

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Organization & Culture
      </h1>

      {/* --- SECTION 1 --- */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <AreaLineChart
            key="formation-ratio"
            title="Employee Formation Rasio"
            subtitle="2025"
            chartData={formationRatioData}
            isLoading={false}
          />
        </div>
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <InfoCard
            title="Employee Formation Rasio"
            metrics={[{ value: "1/4", label: "Enabler/Revenue Generator" }]}
          />
          <InfoCard
            title="Design Organization"
            metrics={[
              { value: 16, label: "Division" },
              { value: 34, label: "Department" },
            ]}
          />
          <InfoCard
            title="AVG Span of Control"
            metrics={[
              { value: 2, label: "Department" },
              { value: 8, label: "Employee" },
            ]}
          />
        </div>
      </div>

      {/* --- SECTION 2 --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Kirim data dan status loading ke komponen chart */}
          <OrganizationHealthChart />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GroupedBarChart
            data={employeeEngagementData}
            isLoading={false} // Karena datanya statis
          />
          <GroupedBarChart
            data={cultureData} // Kirim seluruh objek data
            isLoading={isLoadingCulture}
            cardClassName="bg-[#343A40] text-white"
          />
        </div>
      </div>

      {/* --- SECTION 3 --- */}
      <div className="mt-8">
        <AreaLineChart
          key="hc-maturity"
          title="HC Maturity Assessment"
          subtitle={period.year.toString()}
          chartData={maturityData}
          isLoading={isLoadingMaturity}
          containerClassName="bg-gray-50"
        />
      </div>
    </main>
  );
}
