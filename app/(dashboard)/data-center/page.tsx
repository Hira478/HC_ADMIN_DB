"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFilters } from "@/contexts/FilterContext";
import styles from "./DataCenter.module.css";

// Impor komponen form DAN 'Handle' untuk ref
import DemographyForm, {
  FormHandle as DemographyFormHandle,
} from "@/components/data-center/DemographyForm";
import TalentAcquisitionForm, {
  FormHandle as TAFormHandle,
} from "@/components/data-center/TalentAcquisitionForm";
import TurnOverForm, {
  FormHandle as TOFormHandle,
} from "@/components/data-center/TurnOverForm";
import DivisionForm from "@/components/data-center/DivisionForm";

// Gabungkan semua tipe Handle untuk ref yang dinamis
type FormHandle = DemographyFormHandle | TAFormHandle | TOFormHandle;

// Tipe data hanya untuk tab yang aktif
type TabKey = "demography" | "talent-acquisition" | "turn-over" | "division";

export default function DataCenterPage() {
  const { user, companies, loading: contextLoading } = useFilters();

  const [activeTab, setActiveTab] = useState<TabKey>("demography");
  const [isEditing, setIsEditing] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [localCompanyId, setLocalCompanyId] = useState<number | null>(null);
  const [localPeriod, setLocalPeriod] = useState(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  const formRef = useRef<FormHandle>(null);

  useEffect(() => {
    if (user) {
      setLocalCompanyId(user.companyId);
    }
  }, [user]);

  useEffect(() => {
    setIsFormDirty(false);
  }, [isEditing, activeTab]);

  const renderContent = () => {
    if (contextLoading) return <div>Loading user data...</div>;
    if (!localCompanyId) return <div>Initializing company data...</div>;

    const standardProps = {
      selectedCompany: localCompanyId,
      period: {
        ...localPeriod,
        type: "monthly" as const,
        value: localPeriod.month,
      },
      isEditing: isEditing,
      onSaveSuccess: () => {
        setIsFormDirty(false);
        setIsEditing(false);
      },
      onCancel: () => setIsEditing(false),
      onDirtyChange: setIsFormDirty,
    };

    switch (activeTab) {
      case "demography":
        return (
          <DemographyForm
            ref={formRef as React.Ref<DemographyFormHandle>}
            {...standardProps}
          />
        );
      case "talent-acquisition":
        return (
          <TalentAcquisitionForm
            ref={formRef as React.Ref<TAFormHandle>}
            {...standardProps}
          />
        );
      case "turn-over":
        return (
          <TurnOverForm
            ref={formRef as React.Ref<TOFormHandle>}
            {...standardProps}
          />
        );
      case "division":
        return (
          <DivisionForm
            selectedCompany={localCompanyId}
            period={{
              ...localPeriod,
              type: "monthly",
              value: localPeriod.month,
            }}
            isEditing={isEditing}
          />
        );
      default:
        return <div>This tab is under development.</div>;
    }
  };

  const renderFilterBar = () => {
    if (contextLoading) return null;

    const handleSave = async () => {
      if (formRef.current) {
        await formRef.current.submit();
      }
    };

    const handleDiscard = () => {
      if (isFormDirty) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to discard them?"
          )
        ) {
          setIsEditing(false);
        }
      } else {
        setIsEditing(false);
      }
    };

    const handleFinishDivisionEditing = () => {
      if (
        window.confirm(
          "Are you sure you want to finish editing? All changes are saved automatically."
        )
      ) {
        setIsEditing(false);
      }
    };

    return (
      <div className={styles.filterBar}>
        {/* KODE FILTER BAR DIKEMBALIKAN DI SINI */}
        <div className={styles.filterControls}>
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
                  {new Date(0, m - 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

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
        </div>
        <div className={styles.actionsContainer}>
          {!isEditing && localCompanyId ? (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              Edit Data
            </button>
          ) : isEditing && localCompanyId ? (
            <div className={styles.editingActions}>
              {activeTab !== "division" ? (
                <>
                  <button
                    onClick={handleDiscard}
                    className={styles.cancelButton}
                  >
                    Discard Changes
                  </button>
                  <button onClick={handleSave} className={styles.editButton}>
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFinishDivisionEditing}
                  className={styles.editButton}
                >
                  Finish Editing
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Data Input Forms</h1>
        <p>Choose a filter to fill in or edit data.</p>
      </header>
      {renderFilterBar()}
      <nav className={styles.tabs}>
        <button
          onClick={() => setActiveTab("demography")}
          className={`${styles.tab} ${
            activeTab === "demography" ? styles.active : ""
          }`}
        >
          Demographics
        </button>
        <button
          onClick={() => setActiveTab("division")}
          className={`${styles.tab} ${
            activeTab === "division" ? styles.active : ""
          }`}
        >
          HC per Division
        </button>
        <button
          onClick={() => setActiveTab("talent-acquisition")}
          className={`${styles.tab} ${
            activeTab === "talent-acquisition" ? styles.active : ""
          }`}
        >
          Talent Acquisition
        </button>
        <button
          onClick={() => setActiveTab("turn-over")}
          className={`${styles.tab} ${
            activeTab === "turn-over" ? styles.active : ""
          }`}
        >
          Turn Over
        </button>
      </nav>
      <main className={styles.formContainer}>{renderContent()}</main>
    </div>
  );
}
