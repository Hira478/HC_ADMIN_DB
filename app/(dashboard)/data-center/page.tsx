"use client";

import React, { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";
import styles from "./DataCenter.module.css";
import DemographyForm from "@/components/data-center/DemographyForm";
import ProductivityForm from "@/components/data-center/ProductivityForm";
import PlanningForm from "@/components/data-center/PlanningForm";
import DivisionForm from "@/components/data-center/DivisionForm";

type TabKey =
  | "demography"
  | "productivity"
  | "talent"
  | "planning"
  | "division";

export default function DataCenterPage() {
  const { user, companies, loading: contextLoading } = useFilters();

  const [activeTab, setActiveTab] = useState<TabKey>("demography");
  const [isEditing, setIsEditing] = useState(false);
  const [localCompanyId, setLocalCompanyId] = useState<number | null>(null);
  const [localPeriod, setLocalPeriod] = useState(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  useEffect(() => {
    if (user) {
      // Untuk semua role, defaultnya adalah companyId milik user itu sendiri.
      setLocalCompanyId(user.companyId);
    }
  }, [user]);

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    if (contextLoading) return <div>Memuat data pengguna...</div>;
    if (!localCompanyId) return <div>Menginisialisasi data perusahaan...</div>;

    switch (activeTab) {
      case "demography":
        return (
          <DemographyForm
            selectedCompany={localCompanyId}
            period={{
              ...localPeriod,
              type: "monthly",
              value: localPeriod.month,
            }}
            isEditing={isEditing}
            onSaveSuccess={handleSaveSuccess}
            onCancel={() => setIsEditing(false)}
          />
        );
      case "productivity":
        return (
          <ProductivityForm
            selectedCompany={localCompanyId}
            period={{
              ...localPeriod,
              type: "monthly",
              value: localPeriod.month,
            }}
            isEditing={isEditing}
            onSaveSuccess={handleSaveSuccess}
            onCancel={() => setIsEditing(false)}
          />
        );
      case "planning":
        return (
          <PlanningForm
            selectedCompany={localCompanyId}
            period={{
              ...localPeriod,
              type: "monthly",
              value: localPeriod.month,
            }}
            isEditing={isEditing}
            onSaveSuccess={handleSaveSuccess}
            onCancel={() => setIsEditing(false)}
          />
        );
      case "division":
        return (
          <DivisionForm
            selectedCompany={localCompanyId!}
            period={{
              ...localPeriod,
              type: "monthly",
              value: localPeriod.month,
            }}
          />
        );
      default:
        return <div>Tab ini sedang dalam pengembangan.</div>;
    }
  };

  const renderFilterBar = () => {
    if (contextLoading) return null;
    return (
      <div className={styles.filterBar}>
        <div className={styles.filterControls}>
          {/* PERUBAHAN 1: Filter perusahaan kini HANYA untuk SUPER_ADMIN */}
          {user && user.role === "SUPER_ADMIN" ? (
            <div className={styles.filterGroup}>
              <label htmlFor="company-select">Company</label>
              <select
                id="company-select"
                value={localCompanyId || ""}
                onChange={(e) => setLocalCompanyId(Number(e.target.value))}
                disabled={isEditing}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.filterGroup}>
              <label>Company</label>
              <p className={styles.companyName}>{user?.companyName}</p>
            </div>
          )}

          <div className={styles.filterGroup}>
            <label htmlFor="year-select">Year</label>
            <select
              id="year-select"
              value={localPeriod.year}
              onChange={(e) =>
                setLocalPeriod((p) => ({ ...p, year: Number(e.target.value) }))
              }
              disabled={isEditing}
            >
              {[2025, 2024, 2023, 2022, 2021].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="month-select">Month</label>
            <select
              id="month-select"
              value={localPeriod.month}
              onChange={(e) =>
                setLocalPeriod((p) => ({ ...p, month: Number(e.target.value) }))
              }
              disabled={isEditing}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* PERUBAHAN 2: Tombol Edit dipindah ke sini */}
        <div className={styles.actionsContainer}>
          {!isEditing && localCompanyId && (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              Edit Data
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Data Input Forms</h1>
        <p>Choose Filter to fill or edit data.</p>
      </header>

      {renderFilterBar()}

      <nav className={styles.tabs}>
        <button
          onClick={() => setActiveTab("demography")}
          className={`${styles.tab} ${
            activeTab === "demography" ? styles.active : ""
          }`}
        >
          Demography
        </button>
        {/* PERUBAHAN 3: Hapus atribut 'disabled' */}
        <button
          onClick={() => setActiveTab("productivity")}
          className={`${styles.tab} ${
            activeTab === "productivity" ? styles.active : ""
          }`}
        >
          Productivity & Cost
        </button>
        <button className={styles.tab} disabled>
          Talent & Performance
        </button>
        <button
          onClick={() => setActiveTab("planning")}
          className={`${styles.tab} ${
            activeTab === "planning" ? styles.active : ""
          }`}
        >
          Planning
        </button>
        <button className={styles.tab} disabled>
          RKAP Target
        </button>
        <button className={styles.tab} disabled>
          Culture & Engagement
        </button>
        <button className={styles.tab} disabled>
          Organizational Structure
        </button>
        <button
          onClick={() => setActiveTab("division")}
          className={`${styles.tab} ${
            activeTab === "division" ? styles.active : ""
          }`}
        >
          HC per Division
        </button>
      </nav>

      <main className={styles.formContainer}>
        {renderContent()}
        {/* Tombol edit sudah tidak ada di sini lagi */}
      </main>
    </div>
  );
}
