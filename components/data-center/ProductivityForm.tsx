// File: components/data-center/ProductivityForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";

interface ProductivityFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const initialFormData = {
  productivity: {
    revenue: 0,
    netProfit: 0,
    totalEmployeeCost: 0,
    totalCost: 0,
  },
  employeeCost: {
    salary: 0,
    incentive: 0,
    pension: 0,
    trainingRecruitment: 0,
    others: 0,
  },
};

export default function ProductivityForm({
  selectedCompany,
  period,
  isEditing,
  onSaveSuccess,
  onCancel,
}: ProductivityFormProps) {
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
          `/api/data-center/productivity?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
        );
        if (!res.ok) throw new Error("Gagal mengambil data produktivitas.");
        const data = await res.json();
        setFormData({
          productivity: data.productivity || initialFormData.productivity,
          employeeCost: data.employeeCost || initialFormData.employeeCost,
        });
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error has occurred.");
        setFormData(initialFormData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany, period.year, period.value]);

  const handleInputChange = (
    category: "productivity" | "employeeCost",
    field: string,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
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
      const res = await fetch("/api/data-center/productivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save data.");
      }
      alert("Productivity and cost data has been successfully saved!");
      onSaveSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`);
      } else {
        setError("An unknown error has occurred.");
        alert("An unknown error has occurred.");
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
        <legend>Productivity</legend>
        <div className={styles.inputGroup}>
          <label>Revenue</label>
          <input
            type="number"
            step="any"
            value={formData.productivity.revenue}
            onChange={(e) =>
              handleInputChange("productivity", "revenue", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Net Profit</label>
          <input
            type="number"
            step="any"
            value={formData.productivity.netProfit}
            onChange={(e) =>
              handleInputChange("productivity", "netProfit", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Total Employee Cost</label>
          <input
            type="number"
            step="any"
            value={formData.productivity.totalEmployeeCost}
            onChange={(e) =>
              handleInputChange(
                "productivity",
                "totalEmployeeCost",
                e.target.value
              )
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Total Cost</label>
          <input
            type="number"
            step="any"
            value={formData.productivity.totalCost}
            onChange={(e) =>
              handleInputChange("productivity", "totalCost", e.target.value)
            }
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!isEditing}>
        <legend>Cost Details</legend>
        <div className={styles.inputGroup}>
          <label>Salary</label>
          <input
            type="number"
            step="any"
            value={formData.employeeCost.salary}
            onChange={(e) =>
              handleInputChange("employeeCost", "salary", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Incentive</label>
          <input
            type="number"
            step="any"
            value={formData.employeeCost.incentive}
            onChange={(e) =>
              handleInputChange("employeeCost", "incentive", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Retirement</label>
          <input
            type="number"
            step="any"
            value={formData.employeeCost.pension}
            onChange={(e) =>
              handleInputChange("employeeCost", "pension", e.target.value)
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Training & Recruitment</label>
          <input
            type="number"
            step="any"
            value={formData.employeeCost.trainingRecruitment}
            onChange={(e) =>
              handleInputChange(
                "employeeCost",
                "trainingRecruitment",
                e.target.value
              )
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Others</label>
          <input
            type="number"
            step="any"
            value={formData.employeeCost.others}
            onChange={(e) =>
              handleInputChange("employeeCost", "others", e.target.value)
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
