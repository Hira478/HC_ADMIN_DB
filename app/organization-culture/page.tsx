// app/organization-culture/page.tsx
"use client";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import OrganizationHealthChart from "@/components/charts/OrganizationHealthChart";
import InfoCard from "@/components/ui/InfoCard";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";
import FormationRasioChart from "@/components/charts/FormationRasioChart";
import type { HcmaData, GroupedChartData } from "@/types";

interface FormationRasioMonthData {
  month: string;
  totalHeadcount: number;
  categories: { [key: string]: number };
}

interface OrgStructureData {
  formationRatioChart: { categories: string[]; data: number[] };
  formationRatioCard: { enabler: number; revenueGenerator: number };
  designOrgCard: { division: number; department: number };
  avgSpanCard: { department: number; employee: number };
}

export default function OrganizationCulturePage() {
  const { selectedCompany, period } = useFilters(); // <-- Ambil filter dari context
  const [healthData, setHealthData] = useState<OrganizationHealthData | null>(
    null
  );
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const [cultureData, setCultureData] = useState<HcmaData | null>(null);
  const [isLoadingCulture, setIsLoadingCulture] = useState(true);
  const [engagementData, setEngagementData] = useState<HcmaData | null>(null);
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);

  const [hcmaData, setHcmaData] = useState<HcmaData | null>(null);
  const [isLoadingHcma, setIsLoadingHcma] = useState(true);

  const [orgStructureData, setOrgStructureData] =
    useState<OrgStructureData | null>(null);
  const [isLoadingOrgStructure, setIsLoadingOrgStructure] = useState(true);
  const [formationRasioData, setFormationRasioData] = useState<
    FormationRasioMonthData[] | null
  >(null);
  const [isLoadingFormation, setIsLoadingFormation] = useState(true);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingFormation(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/formation-rasio?companyId=${selectedCompany}&year=${period.year}`
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setFormationRasioData(data);
        } catch (error) {
          console.error(error);
          setFormationRasioData([]);
        } finally {
          setIsLoadingFormation(false);
        }
      };
      fetchData();
    } else {
      setFormationRasioData(null);
      setIsLoadingFormation(false);
    }
  }, [selectedCompany, period.year]);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingHealth(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/organization-health?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch");
          const data: OrganizationHealthData = await res.json();
          setHealthData(data);
        } catch (error) {
          console.error(error);
          setHealthData(null); // Reset data jika ada error
        } finally {
          setIsLoadingHealth(false);
        }
      };
      fetchData();
    } else {
      setHealthData(null);
      setIsLoadingHealth(false);
    }
  }, [selectedCompany, period.year]);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingOrgStructure(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/organization-structure?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch org structure data");
          const data = await res.json();
          setOrgStructureData(data);
        } catch (error) {
          console.error(error);
          setOrgStructureData(null);
        } finally {
          setIsLoadingOrgStructure(false);
        }
      };
      fetchData();
    } else {
      setOrgStructureData(null);
      setIsLoadingOrgStructure(false);
    }
  }, [selectedCompany, period.year]);

  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingEngagement(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/employee-engagement?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch engagement data");
          const data: HcmaData = await res.json();
          setEngagementData(data);
        } catch (error) {
          console.error(error);
          setEngagementData(null);
        } finally {
          setIsLoadingEngagement(false);
        }
      };
      fetchData();
    } else {
      setEngagementData(null);
      setIsLoadingEngagement(false);
    }
  }, [selectedCompany, period.year]);

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
      setIsLoadingHcma(true);
      const fetchData = async () => {
        try {
          const res = await fetch(
            `/api/charts/hc-maturity?companyId=${selectedCompany}&year=${period.year}`
          );
          if (!res.ok) throw new Error("Failed to fetch HCMA data");
          const data: HcmaData = await res.json();
          setHcmaData(data);
        } catch (error) {
          console.error(error);
          setHcmaData(null);
        } finally {
          setIsLoadingHcma(false);
        }
      };
      fetchData();
    } else {
      setHcmaData(null);
      setIsLoadingHcma(false);
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
          const data: HcmaData = await res.json();
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
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
        <div className="w-full lg:w-3/4">
          {/* <AreaLineChart
            key="formation-ratio"
            title="Employee Formation Rasio"
            subtitle={period.year.toString()}
            chartData={orgStructureData?.formationRatioChart || null}
            isLoading={isLoadingOrgStructure}
          />
          */}
          <FormationRasioChart
            title="Employee Formation Rasio"
            subtitle={period.year.toString()}
            data={formationRasioData}
            isLoading={isLoadingFormation}
          />
        </div>
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <InfoCard
            title="Employee Formation Rasio"
            metrics={[
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : // Ganti "/" menjadi ":"
                    `${orgStructureData?.formationRatioCard.enabler || 0}:${
                      orgStructureData?.formationRatioCard.revenueGenerator || 0
                    }`,
                // Ganti juga di label agar konsisten
                label: "Enabler : Revenue Generator",
              },
            ]}
          />
          <InfoCard
            title="Total Division"
            metrics={[
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.designOrgCard.division || 0,
                label: "Division",
              },
            ]}
          />
          <InfoCard
            title="Total Department"
            metrics={[
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.designOrgCard.department || 0,
                label: "Department",
              },
            ]}
          />
        </div>
      </div>

      {/* --- SECTION 2 --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Kirim data dan status loading ke komponen chart */}
          <OrganizationHealthChart
            data={healthData}
            isLoading={isLoadingHealth}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-1">
            <GroupedBarChart
              data={engagementData}
              isLoading={isLoadingEngagement}
            />
          </div>
          <div className="flex-1">
            <GroupedBarChart
              data={cultureData}
              isLoading={isLoadingCulture}
              cardClassName="bg-[#343A40] text-white"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          HC Maturity Assessment (2023)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* --- PERUBAHAN DI SINI --- */}
            <InfoCard
              title="Average Score" // Judul diperbaiki
              metrics={[
                {
                  // Mengambil data Average Score perusahaan
                  value: isLoadingHcma ? "..." : hcmaData?.mainScore || 0,
                  label: "out of 5.0",
                },
              ]}
            />
            <InfoCard
              title="Average IFG Group Score"
              metrics={[
                {
                  // Mengambil data Average Score grup
                  value: isLoadingHcma ? "..." : hcmaData?.ifgAverageScore || 0,
                  label: "Out of 4.0",
                },
              ]}
            />
          </div>
          <div className="lg:col-span-2">
            <GroupedBarChart
              data={hcmaData}
              isLoading={isLoadingHcma}
              cardClassName="bg-white text-gray-800"
              showSummary={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
