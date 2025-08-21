// app/input/scores/page.tsx
"use client";

import { useEffect, useState } from "react";
// 1. Impor semua komponen secara konsisten
import HcmaForm from "@/components/forms/HcmaForm";
import CultureMaturityForm from "@/components/forms/CultureMaturityForm";
import EmployeeEngagementForm from "@/components/forms/EmployeeEngagementForm";
import OrganizationStructureForm from "@/components/forms/OrganizationStructureForm";
import OrganizationHealthForm from "@/components/forms/OrganizationHealthForm";
import { Company } from "@/types";

// 2. Definisikan semua tab di dalam satu array agar rapi
const TABS = [
  { id: "org-structure", label: "Struktur Organisasi" },
  { id: "org-health", label: "Organization Health" },
  { id: "hcma", label: "Skor HCMA" },
  { id: "culture", label: "Skor Culture Maturity" },
  { id: "engagement", label: "Skor Employee Engagement" },
];

export default function InputScoresPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id); // Default ke tab pertama
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const tabStyle = "px-4 py-2 text-sm font-medium rounded-md transition-colors";
  const activeTabStyle = "bg-blue-600 text-white";
  const inactiveTabStyle = "text-gray-600 hover:bg-gray-200";

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Input Skor Perusahaan</h1>

      {/* 3. Render tombol tab secara dinamis menggunakan map */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${tabStyle} ${
              activeTab === tab.id ? activeTabStyle : inactiveTabStyle
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "org-structure" && (
          <OrganizationStructureForm companies={companies} />
        )}
        {activeTab === "org-health" && (
          <OrganizationHealthForm companies={companies} />
        )}
        {activeTab === "hcma" && <HcmaForm companies={companies} />}
        {activeTab === "culture" && (
          <CultureMaturityForm companies={companies} />
        )}
        {activeTab === "engagement" && (
          <EmployeeEngagementForm companies={companies} />
        )}
      </div>
    </main>
  );
}
