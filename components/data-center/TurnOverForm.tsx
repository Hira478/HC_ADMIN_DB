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
interface TurnOverFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const initialFormData = {
  resignCount: 0,
};

// Bungkus komponen dengan forwardRef
const TurnOverForm = forwardRef<FormHandle, TurnOverFormProps>(
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
            `/api/data-center/turn-over?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
          );
          if (!res.ok) throw new Error("Failed to fetch turn over data.");
          const data = await res.json();
          const loadedData = data || initialFormData;
          setFormData(loadedData);
          setOriginalData(loadedData);
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
      const numValue = parseInt(value) || 0;
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
        const res = await fetch("/api/data-center/turn-over", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save data.");
        }
        alert("Turn Over data saved successfully!");
        setOriginalData(formData);
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
          <legend>Turn Over</legend>
          <div className={styles.inputGroup}>
            <label>Resign Count</label>
            <input
              type="number"
              min="0"
              value={formData.resignCount}
              onChange={(e) => handleInputChange("resignCount", e.target.value)}
            />
          </div>
        </fieldset>

        {/* Tombol internal sudah dihapus */}
      </div>
    );
  }
);

TurnOverForm.displayName = "TurnOverForm";

export default TurnOverForm;
