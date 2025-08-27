// app/organization-culture/page.tsx
"use client";
import AreaLineChart from "@/components/charts/AreaLineChart";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import OrganizationHealthChart from "@/components/charts/OrganizationHealthChart";
import InfoCard from "@/components/ui/InfoCard";
import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { OrganizationHealthData } from "@/app/api/charts/organization-health/route";
import { CultureMaturityData } from "@/app/api/charts/culture-maturity/route";
import HcmaBarChart from "@/components/charts/HcmaBarChart";
import FormationRasioChart from "@/components/charts/FormationRasioChart";

interface FormationRasioMonthData {
  month: string;
  totalHeadcount: number;
  categories: { [key: string]: number };
}

interface SimpleChartData {
  categories: string[];
  data: number[];
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

  const [maturityData, setMaturityData] = useState<SimpleChartData | null>(
    null
  );
  const [isLoadingMaturity, setIsLoadingMaturity] = useState(true);
  const [cultureData, setCultureData] = useState<CultureMaturityData | null>(
    null
  );
  const [isLoadingCulture, setIsLoadingCulture] = useState(true);
  const [engagementData, setEngagementData] =
    useState<CultureMaturityData | null>(null);
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);

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
          const data: CultureMaturityData = await res.json();
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
                // Ambil data dari state 'orgStructureData'
                value: isLoadingOrgStructure
                  ? "..."
                  : `${orgStructureData?.formationRatioCard.enabler || 0}/${
                      orgStructureData?.formationRatioCard.revenueGenerator || 0
                    }`,
                label: "Enabler/\nRevenue Generator",
              },
            ]}
          />
          <InfoCard
            title="Design Organization"
            metrics={[
              // Ambil data dari state 'orgStructureData'
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.designOrgCard.division || 0,
                label: "Division",
              },
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.designOrgCard.department || 0,
                label: "Department",
              },
            ]}
          />
          <InfoCard
            title="AVG Span of Control"
            metrics={[
              // Ambil data dari state 'orgStructureData'
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.avgSpanCard.department || 0,
                label: "Department",
              },
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : orgStructureData?.avgSpanCard.employee || 0,
                label: "Employee",
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

      {/* --- SECTION 3 --- */}
      <div className="mt-8">
        <HcmaBarChart
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
