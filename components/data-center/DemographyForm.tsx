"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";

// Tipe props yang diterima dari parent
export interface DemographyFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void; // Tetap diterima untuk mereset state saat discard
  onDirtyChange: (isDirty: boolean) => void;
}

// Tipe handle yang diekspos ke parent melalui ref
export interface FormHandle {
  submit: () => Promise<void>;
}

// Tipe Data untuk form ini
interface DemographyData {
  headcount: { maleCount: number; femaleCount: number; totalCount: number };
  employeeStatus: {
    permanentCount: number;
    contractCount: number;
    totalCount: number;
  };
  education: {
    smaSmkCount: number;
    d3Count: number;
    s1Count: number;
    s2Count: number;
    s3Count: number;
    totalCount: number;
  };
  level: {
    bod1Count: number;
    bod2Count: number;
    bod3Count: number;
    bod4Count: number;
    totalCount: number;
  };
  age: {
    under25Count: number;
    age26to40Count: number;
    age41to50Count: number;
    over50Count: number;
    totalCount: number;
  };
  lengthOfService: {
    los_0_5_Count: number;
    los_6_10_Count: number;
    los_11_15_Count: number;
    los_16_20_Count: number;
    los_21_25_Count: number;
    los_25_30_Count: number;
    los_over_30_Count: number;
    totalCount: number;
  };
}

// State awal untuk form kosong
const initialDemographyData: DemographyData = {
  headcount: { maleCount: 0, femaleCount: 0, totalCount: 0 },
  employeeStatus: { permanentCount: 0, contractCount: 0, totalCount: 0 },
  education: {
    smaSmkCount: 0,
    d3Count: 0,
    s1Count: 0,
    s2Count: 0,
    s3Count: 0,
    totalCount: 0,
  },
  level: {
    bod1Count: 0,
    bod2Count: 0,
    bod3Count: 0,
    bod4Count: 0,
    totalCount: 0,
  },
  age: {
    under25Count: 0,
    age26to40Count: 0,
    age41to50Count: 0,
    over50Count: 0,
    totalCount: 0,
  },
  lengthOfService: {
    los_0_5_Count: 0,
    los_6_10_Count: 0,
    los_11_15_Count: 0,
    los_16_20_Count: 0,
    los_21_25_Count: 0,
    los_25_30_Count: 0,
    los_over_30_Count: 0,
    totalCount: 0,
  },
};

const formatLabel = (key: string): string => {
  if (key.startsWith("los_")) {
    return key.replace("los_", "").replace("_Count", "").replace(/_/g, "-");
  }
  return key
    .replace(/([A-Z])/g, " $1")
    .replace("Count", "")
    .replace("sma Smk", "SMA/SMK")
    .replace("bod", "BOD-")
    .replace("under", "< ")
    .replace("age", "")
    .replace("to", "-")
    .replace("over", "> ")
    .trim();
};

const fieldsToExclude = ["id", "month", "year", "companyId", "totalCount"];

const DemographyForm = forwardRef<FormHandle, DemographyFormProps>(
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
    const [formData, setFormData] = useState<DemographyData>(
      initialDemographyData
    );
    const [originalData, setOriginalData] = useState<DemographyData | null>(
      null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Efek untuk 'dirty check'
    useEffect(() => {
      if (!originalData || !isEditing) {
        onDirtyChange(false);
        return;
      }
      const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
      onDirtyChange(isDirty);
    }, [formData, originalData, onDirtyChange, isEditing]);

    // Efek untuk mengambil data dari server
    useEffect(() => {
      if (!selectedCompany || !period.year || !period.value) return;
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(
            `/api/data-center/demography?year=${period.year}&month=${period.value}&companyId=${selectedCompany}`
          );
          if (!res.ok) throw new Error("Failed to fetch demographic data.");
          const data = await res.json();
          const loadedData = {
            headcount: data.headcount || initialDemographyData.headcount,
            employeeStatus:
              data.employeeStatus || initialDemographyData.employeeStatus,
            education: data.education || initialDemographyData.education,
            level: data.level || initialDemographyData.level,
            age: data.age || initialDemographyData.age,
            lengthOfService:
              data.lengthOfService || initialDemographyData.lengthOfService,
          };
          setFormData(loadedData);
          setOriginalData(loadedData);
        } catch (err) {
          if (err instanceof Error) setError(err.message);
          else setError("An unknown error occurred.");
          setFormData(initialDemographyData);
          setOriginalData(initialDemographyData);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [selectedCompany, period.year, period.value]);

    // Efek untuk mereset state jika mode edit dibatalkan dari parent
    useEffect(() => {
      if (!isEditing && originalData) {
        setFormData(originalData);
      }
    }, [isEditing, originalData]);

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

    // Efek untuk kalkulasi total
    useEffect(() => {
      setFormData((prev) => {
        const sumValues = (obj: Record<string, number>) =>
          Object.entries(obj)
            .filter(([key]) => key !== "totalCount")
            .reduce((acc, [, value]) => acc + (value || 0), 0);
        return {
          ...prev,
          headcount: {
            ...prev.headcount,
            totalCount: sumValues(prev.headcount),
          },
          employeeStatus: {
            ...prev.employeeStatus,
            totalCount: sumValues(prev.employeeStatus),
          },
          education: {
            ...prev.education,
            totalCount: sumValues(prev.education),
          },
          level: { ...prev.level, totalCount: sumValues(prev.level) },
          age: { ...prev.age, totalCount: sumValues(prev.age) },
          lengthOfService: {
            ...prev.lengthOfService,
            totalCount: sumValues(prev.lengthOfService),
          },
        };
      });
    }, [
      formData.headcount.maleCount,
      formData.headcount.femaleCount,
      formData.employeeStatus.permanentCount,
      formData.employeeStatus.contractCount,
      formData.education.smaSmkCount,
      formData.education.d3Count,
      formData.education.s1Count,
      formData.education.s2Count,
      formData.education.s3Count,
      formData.level.bod1Count,
      formData.level.bod2Count,
      formData.level.bod3Count,
      formData.level.bod4Count,
      formData.age.under25Count,
      formData.age.age26to40Count,
      formData.age.age41to50Count,
      formData.age.over50Count,
      formData.lengthOfService.los_0_5_Count,
      formData.lengthOfService.los_6_10_Count,
      formData.lengthOfService.los_11_15_Count,
      formData.lengthOfService.los_16_20_Count,
      formData.lengthOfService.los_21_25_Count,
      formData.lengthOfService.los_25_30_Count,
      formData.lengthOfService.los_over_30_Count,
    ]);

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
        const res = await fetch("/api/data-center/demography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save data.");
        }
        alert("Demographic data has been successfully saved!");
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

    // Mengekspos fungsi submitForm ke parent melalui ref
    useImperativeHandle(ref, () => ({
      submit: submitForm,
    }));

    return (
      <div className={styles.form}>
        {isLoading && (
          <div className={styles.loadingOverlay}>Loading data..</div>
        )}
        {error && <div className={styles.errorBanner}>{error}</div>}

        <fieldset className={styles.fieldset} disabled={!isEditing}>
          <legend>Headcount</legend>
          <div className={styles.inputGroup}>
            <label>Male</label>
            <input
              type="number"
              min="0"
              value={formData.headcount.maleCount || 0}
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
              value={formData.headcount.femaleCount || 0}
              onChange={(e) =>
                handleInputChange("headcount", "femaleCount", e.target.value)
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.headcount.totalCount || 0}
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
              value={formData.employeeStatus.permanentCount || 0}
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
              value={formData.employeeStatus.contractCount || 0}
              onChange={(e) =>
                handleInputChange(
                  "employeeStatus",
                  "contractCount",
                  e.target.value
                )
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.employeeStatus.totalCount || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset} disabled={!isEditing}>
          <legend>Education Level</legend>
          {Object.entries(formData.education)
            .filter(([key]) => !fieldsToExclude.includes(key))
            .map(([key, value]) => (
              <div className={styles.inputGroup} key={key}>
                <label>{formatLabel(key)}</label>
                <input
                  type="number"
                  min="0"
                  value={String(value || 0)}
                  onChange={(e) =>
                    handleInputChange("education", key, e.target.value)
                  }
                />
              </div>
            ))}
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.education.totalCount || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
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
                  value={String(value || 0)}
                  onChange={(e) =>
                    handleInputChange("level", key, e.target.value)
                  }
                />
              </div>
            ))}
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.level.totalCount || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
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
                  value={String(value || 0)}
                  onChange={(e) =>
                    handleInputChange("age", key, e.target.value)
                  }
                />
              </div>
            ))}
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.age.totalCount || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
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
                  value={String(value || 0)}
                  onChange={(e) =>
                    handleInputChange("lengthOfService", key, e.target.value)
                  }
                />
              </div>
            ))}
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={formData.lengthOfService.totalCount || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
        </fieldset>

        {/* Tombol-tombol internal sudah tidak ada di sini */}
      </div>
    );
  }
);

DemographyForm.displayName = "DemographyForm";

export default DemographyForm;
