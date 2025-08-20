// app/input/scores/page.tsx
"use client";

import { useEffect, useState } from "react";
import HcmaForm from "@/components/forms/HcmaForm";
import CultureMaturityForm from "@/components/forms/CultureMaturityForm";
import { Company } from "@/types";

export default function InputScoresPage() {
  const [activeTab, setActiveTab] = useState("hcma");
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

      <div className="mb-6 flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("hcma")}
          className={`${tabStyle} ${
            activeTab === "hcma" ? activeTabStyle : inactiveTabStyle
          }`}
        >
          Skor HCMA
        </button>
        <button
          onClick={() => setActiveTab("culture")}
          className={`${tabStyle} ${
            activeTab === "culture" ? activeTabStyle : inactiveTabStyle
          }`}
        >
          Skor Culture Maturity
        </button>
      </div>

      <div>
        {activeTab === "hcma" && <HcmaForm companies={companies} />}
        {activeTab === "culture" && (
          <CultureMaturityForm companies={companies} />
        )}
      </div>
    </main>
  );
}
