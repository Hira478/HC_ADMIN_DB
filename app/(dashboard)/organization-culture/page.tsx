"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";

// Komponen yang digunakan
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import OrganizationHealthChart from "@/components/charts/OrganizationHealthChart";
import InfoCard from "@/components/ui/InfoCard";
import FormationRasioTable from "@/components/tables/FormationRasioTable";

// Tipe data terpusat
import type {
  OrganizationHealthData,
  GroupedChartData,
  HcmaData,
  OrgStructureData,
  FormationRasioTableData,
} from "@/types";

export default function OrganizationCulturePage() {
  const { selectedCompany, period } = useFilters();

  // State untuk Section 1
  const [orgStructureData, setOrgStructureData] =
    useState<OrgStructureData | null>(null);
  const [isLoadingOrgStructure, setIsLoadingOrgStructure] = useState(true);
  const [formationRasioData, setFormationRasioData] =
    useState<FormationRasioTableData | null>(null);
  const [isLoadingFormation, setIsLoadingFormation] = useState(true);
  const [formationPage, setFormationPage] = useState(1);

  // State untuk Section 2
  const [healthData, setHealthData] = useState<OrganizationHealthData | null>(
    null
  );
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [engagementData, setEngagementData] = useState<GroupedChartData | null>(
    null
  );
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);
  const [cultureData, setCultureData] = useState<GroupedChartData | null>(null);
  const [isLoadingCulture, setIsLoadingCulture] = useState(true);

  // State untuk Section 3
  const [hcmaData, setHcmaData] = useState<HcmaData | null>(null);
  const [isLoadingHcma, setIsLoadingHcma] = useState(true);

  // useEffect untuk Formation Rasio Table (dengan paginasi)
  // useEffect untuk Formation Rasio Table (dengan paginasi)
  useEffect(() => {
    if (selectedCompany && period.year && period.value) {
      setIsLoadingFormation(true);
      const params = new URLSearchParams({
        companyId: String(selectedCompany),
        year: String(period.year),
        month: String(period.value),
        page: String(formationPage),
      });

      fetch(`/api/charts/formation-rasio?${params.toString()}`)
        .then((res) => {
          // TAMBAHKAN PENGECEKAN INI
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Tambahkan juga pengecekan validitas data
          if (data && data.meta) {
            setFormationRasioData(data);
          } else {
            throw new Error("Invalid data format received");
          }
        })
        .catch((err) => {
          // Blok catch ini sekarang akan menangani error HTTP dan data invalid
          console.error("Error fetching formation rasio table:", err);
          setFormationRasioData(null); // Set ke null agar data benar-benar kosong
        })
        .finally(() => setIsLoadingFormation(false));
    }
  }, [selectedCompany, period, formationPage]);

  // useEffect untuk Organization Structure Cards
  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingOrgStructure(true);
      fetch(
        `/api/charts/organization-structure?companyId=${selectedCompany}&year=${period.year}`
      )
        .then((res) => res.json())
        .then((data) => setOrgStructureData(data))
        .catch((err) => {
          console.error("Error fetching org structure:", err);
          setOrgStructureData(null);
        })
        .finally(() => setIsLoadingOrgStructure(false));
    }
  }, [selectedCompany, period.year]);

  // useEffect untuk Organization Health Chart
  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingHealth(true);
      fetch(
        `/api/charts/organization-health?companyId=${selectedCompany}&year=${period.year}`
      )
        .then((res) => res.json())
        .then((data) => setHealthData(data))
        .catch((err) => {
          console.error("Error fetching org health:", err);
          setHealthData(null);
        })
        .finally(() => setIsLoadingHealth(false));
    }
  }, [selectedCompany, period.year]);

  // useEffect untuk Employee Engagement Chart
  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingEngagement(true);
      fetch(
        `/api/charts/employee-engagement?companyId=${selectedCompany}&year=${period.year}`
      )
        .then((res) => {
          // 1. Periksa apakah respons server OK (status 200-299)
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // 2. (Opsional tapi disarankan) Periksa apakah data memiliki properti yang diharapkan
          if (data && data.chartData) {
            setEngagementData(data);
          } else {
            // Data valid JSON tapi tidak sesuai format yang diharapkan
            throw new Error("Invalid data format received");
          }
        })
        .catch((err) => {
          // 3. Blok catch sekarang akan menangani error HTTP dan error parsing
          console.error("Error fetching engagement:", err);
          setEngagementData(null); // Set ke null jika ada error APAPUN
        })
        .finally(() => setIsLoadingEngagement(false));
    }
  }, [selectedCompany, period.year]);

  // useEffect untuk Culture Maturity Chart
  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingCulture(true);
      fetch(
        `/api/charts/culture-maturity?companyId=${selectedCompany}&year=${period.year}`
      )
        .then((res) => res.json())
        .then((data) => setCultureData(data))
        .catch((err) => {
          console.error("Error fetching culture:", err);
          setCultureData(null);
        })
        .finally(() => setIsLoadingCulture(false));
    }
  }, [selectedCompany, period.year]);

  // useEffect untuk HC Maturity Assessment
  useEffect(() => {
    if (selectedCompany && period.year) {
      setIsLoadingHcma(true);
      fetch(
        `/api/charts/hc-maturity?companyId=${selectedCompany}&year=${period.year}`
      )
        .then((res) => res.json())
        .then((data) => setHcmaData(data))
        .catch((err) => {
          console.error("Error fetching HCMA:", err);
          setHcmaData(null);
        })
        .finally(() => setIsLoadingHcma(false));
    }
  }, [selectedCompany, period.year]);

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Organization & Culture
      </h1>

      {/* --- SECTION 1 --- */}
      {/* --- SECTION 1 --- */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <div className="w-full lg:w-3/4">
          <FormationRasioTable
            title="Employee Formation Rasio"
            subtitle={period.year.toString()}
            data={formationRasioData?.data || []}
            meta={formationRasioData?.meta || { currentPage: 1, totalPages: 1 }}
            isLoading={isLoadingFormation}
            onPageChange={setFormationPage}
          />
        </div>
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <InfoCard
            title="Employee Formation Rasio"
            alignMode="start"
            tooltipText="Perbandingan antara jumlah karyawan Enabler (pendukung) dengan Revenue Generator (penghasil pendapatan)."
            tooltipAlign="right"
            metrics={[
              {
                value: isLoadingOrgStructure
                  ? "..."
                  : `${orgStructureData?.formationRatioCard.enabler || 0}:${
                      orgStructureData?.formationRatioCard.revenueGenerator || 0
                    }`,
                label: "Enabler : \nRevenue Generator",
              },
            ]}
          />
          <InfoCard
            title="Total Division"
            tooltipText="Jumlah total divisi yang aktif di perusahaan pada periode yang dipilih."
            tooltipAlign="right"
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
            tooltipText="Jumlah total departemen yang aktif di perusahaan pada periode yang dipilih."
            tooltipAlign="right"
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
              tooltipText="Employee Engagement Index mengukur tingkat keterikatan karyawan melalui 3 dimensi: Say, Stay, dan Strive."
            />
          </div>
          <div className="flex-1">
            <GroupedBarChart
              data={cultureData}
              isLoading={isLoadingCulture}
              cardClassName="bg-[#343A40] text-white"
              tooltipText="Culture Maturity Index mengukur tingkat kematangan implementasi budaya AKHLAK di perusahaan."
            />
          </div>
        </div>
      </div>

      {/* --- SECTION 3 --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          HC Maturity Assessment
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <InfoCard
              title="Average Score"
              tooltipText="Ini Average Score dari 5 dimensi penilaian HC Maturity Assessment."
              metrics={[
                {
                  value: isLoadingHcma
                    ? "..."
                    : hcmaData?.mainScore?.toFixed(2) || 0,
                  label: "out of 4.0",
                },
              ]}
            />
            <InfoCard
              title="Average IFG Group Score"
              tooltipText="Ini Average Score dari kelompok IFG dalam HC Maturity Assessment."
              metrics={[
                {
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
              yAxisMax={4}
              tooltipText="Detail skor HC Maturity Assessment berdasarkan 5 dimensi penilaian."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
