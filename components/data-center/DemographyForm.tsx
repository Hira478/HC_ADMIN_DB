"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";

interface DemographyFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

interface DemographyData {
  headcount: { maleCount: number; femaleCount: number; totalCount: number };
  employeeStatus: { permanentCount: number; contractCount: number };
  education: {
    smaSmkCount: number;
    d3Count: number;
    s1Count: number;
    s2Count: number;
    s3Count: number;
  };
  level: {
    bod1Count: number;
    bod2Count: number;
    bod3Count: number;
    bod4Count: number;
  };
  age: {
    under25Count: number;
    age26to40Count: number;
    age41to50Count: number;
    over50Count: number;
  };
  lengthOfService: {
    los_0_5_Count: number;
    los_6_10_Count: number;
    los_11_15_Count: number;
    los_16_20_Count: number;
    los_21_25_Count: number;
    los_25_30_Count: number;
    los_over_30_Count: number;
  };
}

const initialDemographyData: DemographyData = {
  headcount: { maleCount: 0, femaleCount: 0, totalCount: 0 },
  employeeStatus: { permanentCount: 0, contractCount: 0 },
  education: { smaSmkCount: 0, d3Count: 0, s1Count: 0, s2Count: 0, s3Count: 0 },
  level: { bod1Count: 0, bod2Count: 0, bod3Count: 0, bod4Count: 0 },
  age: {
    under25Count: 0,
    age26to40Count: 0,
    age41to50Count: 0,
    over50Count: 0,
  },
  lengthOfService: {
    los_0_5_Count: 0,
    los_6_10_Count: 0,
    los_11_15_Count: 0,
    los_16_20_Count: 0,
    los_21_25_Count: 0,
    los_25_30_Count: 0,
    los_over_30_Count: 0,
  },
};

// PERBAIKAN 2: Logika baru untuk format label yang lebih baik dan spesifik
const formatLabel = (key: string): string => {
  // Menangani format "los_X_Y_Count" secara khusus
  if (key.startsWith("los_")) {
    return key.replace("los_", "").replace("_Count", "").replace(/_/g, "-"); // Contoh: los_0_5_Count -> 0-5
  }
  // Menangani format lainnya
  return key
    .replace(/([A-Z])/g, " $1") // smaSmkCount -> sma Smk Count
    .replace("Count", "") // -> sma Smk
    .replace("sma Smk", "SMA/SMK")
    .replace("bod", "BOD-")
    .replace("under", "< ")
    .replace("age", "")
    .replace("to", "-")
    .replace("over", "> ")
    .trim();
};

const fieldsToExclude = ["id", "month", "year", "companyId"];

export default function DemographyForm({
  selectedCompany,
  period,
  isEditing,
  onSaveSuccess,
  onCancel,
}: DemographyFormProps) {
  const [formData, setFormData] = useState<DemographyData>(
    initialDemographyData
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompany || !period.year || !period.value) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data-center/demography?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
        );
        if (!res.ok) throw new Error("Gagal mengambil data demografi.");
        const data = await res.json();
        setFormData({
          headcount: data.headcount || initialDemographyData.headcount,
          employeeStatus:
            data.employeeStatus || initialDemographyData.employeeStatus,
          education: data.education || initialDemographyData.education,
          level: data.level || initialDemographyData.level,
          age: data.age || initialDemographyData.age,
          lengthOfService:
            data.lengthOfService || initialDemographyData.lengthOfService,
        });
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Terjadi kesalahan yang tidak diketahui.");
        setFormData(initialDemographyData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period.year, period.value]);

  const handleInputChange = (
    category: keyof DemographyData,
    field: string,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: numValue },
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      headcount: {
        ...prev.headcount,
        totalCount:
          (prev.headcount.maleCount || 0) + (prev.headcount.femaleCount || 0),
      },
    }));
  }, [formData.headcount.maleCount, formData.headcount.femaleCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        year: period.year,
        month: period.value,
        companyId: selectedCompany,
      };
      const res = await fetch("/api/data-center/demography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan data.");
      }
      alert("Demographic data has been successfully saved!");
      onSaveSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
        alert("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {isLoading && <div className={styles.loadingOverlay}>Loading data..</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Headcount</legend>
        <div className={styles.inputGroup}>
          <label>Male</label>
          <input
            type="number"
            min="0"
            value={formData.headcount.maleCount}
            onChange={(e) =>
              handleInputChange("headcount", "maleCount", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Female</label>
          <input
            type="number"
            min="0"
            value={formData.headcount.femaleCount}
            onChange={(e) =>
              handleInputChange("headcount", "femaleCount", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Total</label>
          <input
            type="number"
            value={formData.headcount.totalCount}
            readOnly
            className={styles.readOnly}
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Employee Status</legend>
        <div className={styles.inputGroup}>
          <label>Permanent</label>
          <input
            type="number"
            min="0"
            value={formData.employeeStatus.permanentCount}
            onChange={(e) =>
              handleInputChange(
                "employeeStatus",
                "permanentCount",
                e.target.value
              )
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Contract</label>
          <input
            type="number"
            min="0"
            value={formData.employeeStatus.contractCount}
            onChange={(e) =>
              handleInputChange(
                "employeeStatus",
                "contractCount",
                e.target.value
              )
            }
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Education Level</legend>
        {Object.entries(formData.education)
          // PERBAIKAN 1: Filter untuk menghilangkan field yang tidak diinginkan
          .filter(([key]) => !fieldsToExclude.includes(key))
          .map(([key, value]) => (
            <div className={styles.inputGroup} key={key}>
              <label>{formatLabel(key)}</label>
              <input
                type="number"
                min="0"
                value={String(value)}
                onChange={(e) =>
                  handleInputChange("education", key, e.target.value)
                }
              />
            </div>
          ))}
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Job Level</legend>
        {Object.entries(formData.level)
          .filter(([key]) => !fieldsToExclude.includes(key))
          .map(([key, value]) => (
            <div className={styles.inputGroup} key={key}>
              <label>{formatLabel(key)}</label>
              <input
                type="number"
                min="0"
                value={String(value)}
                onChange={(e) =>
                  handleInputChange("level", key, e.target.value)
                }
              />
            </div>
          ))}
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Age Range (Years)</legend>
        {Object.entries(formData.age)
          .filter(([key]) => !fieldsToExclude.includes(key))
          .map(([key, value]) => (
            <div className={styles.inputGroup} key={key}>
              <label>{formatLabel(key)}</label>
              <input
                type="number"
                min="0"
                value={String(value)}
                onChange={(e) => handleInputChange("age", key, e.target.value)}
              />
            </div>
          ))}
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Length of Service</legend>
        {Object.entries(formData.lengthOfService)
          .filter(([key]) => !fieldsToExclude.includes(key))
          .map(([key, value]) => (
            <div className={styles.inputGroup} key={key}>
              <label>{formatLabel(key)}</label>
              <input
                type="number"
                min="0"
                value={String(value)}
                onChange={(e) =>
                  handleInputChange("lengthOfService", key, e.target.value)
                }
              />
            </div>
          ))}
      </fieldset>

      {isEditing && (
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
}
