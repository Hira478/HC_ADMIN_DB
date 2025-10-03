"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";

// Definisikan Handle untuk Ref
export interface FormHandle {
  submit: () => Promise<void>;
}

// Definisikan tipe props baru
interface TalentAcquisitionFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const initialFormData = {
  newHireCount: 0,
  costOfHire: 0,
  newHireRetention: 0,
};

// Bungkus komponen dengan forwardRef
const TalentAcquisitionForm = forwardRef<
  FormHandle,
  TalentAcquisitionFormProps
>(
  (
    {
      selectedCompany,
      period,
      isEditing,
      onSaveSuccess,
      onCancel,
      onDirtyChange,
    },
    ref
  ) => {
    const [formData, setFormData] = useState(initialFormData);
    const [originalData, setOriginalData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Efek untuk 'dirty check'
    useEffect(() => {
      if (!isEditing) {
        onDirtyChange(false);
        return;
      }
      const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
      onDirtyChange(isDirty);
    }, [formData, originalData, onDirtyChange, isEditing]);

    // Efek untuk mengambil data
    useEffect(() => {
      if (!selectedCompany || !period.year || !period.value) return;
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(
            `/api/data-center/talent-acquisition?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
          );
          if (!res.ok)
            throw new Error("Failed to fetch talent acquisition data.");
          const data = await res.json();
          const loadedData = data || initialFormData;
          setFormData(loadedData);
          setOriginalData(loadedData); // Simpan snapshot data asli
        } catch (err) {
          if (err instanceof Error) setError(err.message);
          else setError("An unknown error occurred.");
          setFormData(initialFormData);
          setOriginalData(initialFormData);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [selectedCompany, period.year, period.value]);

    // Efek untuk mereset state jika mode edit dibatalkan
    useEffect(() => {
      if (!isEditing) {
        setFormData(originalData);
      }
    }, [isEditing, originalData]);

    const handleInputChange = (field: string, value: string) => {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    };

    // Fungsi submit yang akan dipanggil oleh parent
    const submitForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = {
          ...formData,
          year: period.year,
          month: period.value,
          companyId: selectedCompany,
        };
        const res = await fetch("/api/data-center/talent-acquisition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save data.");
        }
        alert("Talent Acquisition data saved successfully!");
        setOriginalData(formData); // Update data asli setelah save
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

    // Mengekspos fungsi submitForm ke parent
    useImperativeHandle(ref, () => ({
      submit: submitForm,
    }));

    return (
      <div className={styles.form}>
        {isLoading && (
          <div className={styles.loadingOverlay}>Loading data...</div>
        )}
        {error && <div className={styles.errorBanner}>{error}</div>}

        <fieldset className={styles.fieldset} disabled={!isEditing}>
          <legend>Talent Acquisition</legend>
          <div className={styles.inputGroup}>
            <label>New Hire Count</label>
            <input
              type="number"
              min="0"
              value={formData.newHireCount}
              onChange={(e) =>
                handleInputChange("newHireCount", e.target.value)
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Cost of Hire (in Millions)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.costOfHire}
              onChange={(e) => handleInputChange("costOfHire", e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>New Hire Retention (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.newHireRetention}
              onChange={(e) =>
                handleInputChange("newHireRetention", e.target.value)
              }
            />
          </div>
        </fieldset>

        {/* Tombol internal sudah dihapus */}
      </div>
    );
  }
);

TalentAcquisitionForm.displayName = "TalentAcquisitionForm";

export default TalentAcquisitionForm;
