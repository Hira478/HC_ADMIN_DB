// File: components/data-center/PlanningForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";

interface PlanningFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const initialFormData = {
  manpowerPlanning: { plannedCount: 0 },
  formationRasio: {
    strategy: 0,
    business: 0,
    finance: 0,
    hcGa: 0,
    operation: 0,
    compliance: 0,
    it: 0,
  },
};

export default function PlanningForm({
  selectedCompany,
  period,
  isEditing,
  onSaveSuccess,
  onCancel,
}: PlanningFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompany || !period.year || !period.value) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data-center/planning?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
        );
        if (!res.ok) throw new Error("Failed to fetch planning data.");
        const data = await res.json();
        setFormData({
          manpowerPlanning:
            data.manpowerPlanning || initialFormData.manpowerPlanning,
          formationRasio: data.formationRasio || initialFormData.formationRasio,
        });
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred.");
        setFormData(initialFormData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period.year, period.value]);

  const handleInputChange = (
    category: "manpowerPlanning" | "formationRasio",
    field: string,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: numValue },
    }));
  };

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
      const res = await fetch("/api/data-center/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save data.");
      }
      alert("Planning data saved successfully!");
      onSaveSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`);
      } else {
        setError("An unknown error occurred.");
        alert("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {isLoading && (
        <div className={styles.loadingOverlay}>Loading data...</div>
      )}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Manpower Planning</legend>
        <div className={styles.inputGroup}>
          <label>Total Planned Employees</label>
          <input
            type="number"
            min="0"
            value={formData.manpowerPlanning.plannedCount}
            onChange={(e) =>
              handleInputChange(
                "manpowerPlanning",
                "plannedCount",
                e.target.value
              )
            }
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Formation Ratio</legend>
        <div className={styles.inputGroup}>
          <label>Strategy</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.strategy}
            onChange={(e) =>
              handleInputChange("formationRasio", "strategy", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Business</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.business}
            onChange={(e) =>
              handleInputChange("formationRasio", "business", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Finance</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.finance}
            onChange={(e) =>
              handleInputChange("formationRasio", "finance", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>HC & GA</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.hcGa}
            onChange={(e) =>
              handleInputChange("formationRasio", "hcGa", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Operation</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.operation}
            onChange={(e) =>
              handleInputChange("formationRasio", "operation", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Compliance</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.compliance}
            onChange={(e) =>
              handleInputChange("formationRasio", "compliance", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>IT</label>
          <input
            type="number"
            min="0"
            value={formData.formationRasio.it}
            onChange={(e) =>
              handleInputChange("formationRasio", "it", e.target.value)
            }
          />
        </div>
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
