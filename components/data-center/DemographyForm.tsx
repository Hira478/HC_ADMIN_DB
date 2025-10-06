"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import {
  DemographyManualInputData,
  DemographyManualInputPayload,
} from "@/types"; // <-- 1. IMPORT TIPE BARU
import type { Period } from "@/contexts/FilterContext";

// Tipe props yang diterima dari parent (tidak berubah)
export interface DemographyFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export interface FormHandle {
  submit: () => Promise<void>;
}

// Definisikan tipe spesifik untuk setiap bagian
interface HeadcountState {
  permanent: { male: number; female: number };
  contract: { male: number; female: number };
}
interface EducationState {
  permanent: { smaSmk: number; d3: number; s1: number; s2: number; s3: number };
  contract: { smaSmk: number; d3: number; s1: number; s2: number; s3: number };
}
interface LevelState {
  permanent: { bod1: number; bod2: number; bod3: number; bod4: number };
  contract: { bod1: number; bod2: number; bod3: number; bod4: number };
}
interface AgeState {
  permanent: {
    under25: number;
    age26to40: number;
    age41to50: number;
    over50: number;
  };
  contract: {
    under25: number;
    age26to40: number;
    age41to50: number;
    over50: number;
  };
}
interface LosState {
  permanent: {
    los_0_5: number;
    los_6_10: number;
    los_11_15: number;
    los_16_20: number;
    los_21_25: number;
    los_25_30: number;
    los_over_30: number;
  };
  contract: {
    los_0_5: number;
    los_6_10: number;
    los_11_15: number;
    los_16_20: number;
    los_21_25: number;
    los_25_30: number;
    los_over_30: number;
  };
}

interface FormStateData {
  headcount: HeadcountState;
  education: EducationState;
  level: LevelState;
  age: AgeState;
  lengthOfService: LosState;
}

const initialFormState: FormStateData = {
  headcount: {
    permanent: { male: 0, female: 0 },
    contract: { male: 0, female: 0 },
  },
  education: {
    permanent: { smaSmk: 0, d3: 0, s1: 0, s2: 0, s3: 0 },
    contract: { smaSmk: 0, d3: 0, s1: 0, s2: 0, s3: 0 },
  },
  level: {
    permanent: { bod1: 0, bod2: 0, bod3: 0, bod4: 0 },
    contract: { bod1: 0, bod2: 0, bod3: 0, bod4: 0 },
  },
  age: {
    permanent: { under25: 0, age26to40: 0, age41to50: 0, over50: 0 },
    contract: { under25: 0, age26to40: 0, age41to50: 0, over50: 0 },
  },
  lengthOfService: {
    permanent: {
      los_0_5: 0,
      los_6_10: 0,
      los_11_15: 0,
      los_16_20: 0,
      los_21_25: 0,
      los_25_30: 0,
      los_over_30: 0,
    },
    contract: {
      los_0_5: 0,
      los_6_10: 0,
      los_11_15: 0,
      los_16_20: 0,
      los_21_25: 0,
      los_25_30: 0,
      los_over_30: 0,
    },
  },
};

// Fungsi helper untuk mengubah data API menjadi state form
const transformApiDataToFormState = (
  apiData: DemographyManualInputData
): FormStateData => {
  return {
    headcount: {
      permanent: {
        male: apiData.headcount?.malePermanent ?? 0,
        female: apiData.headcount?.femalePermanent ?? 0,
      },
      contract: {
        male: apiData.headcount?.maleContract ?? 0,
        female: apiData.headcount?.femaleContract ?? 0,
      },
    },
    education: {
      permanent: {
        smaSmk: apiData.education?.smaSmkPermanent ?? 0,
        d3: apiData.education?.d3Permanent ?? 0,
        s1: apiData.education?.s1Permanent ?? 0,
        s2: apiData.education?.s2Permanent ?? 0,
        s3: apiData.education?.s3Permanent ?? 0,
      },
      contract: {
        smaSmk: apiData.education?.smaSmkContract ?? 0,
        d3: apiData.education?.d3Contract ?? 0,
        s1: apiData.education?.s1Contract ?? 0,
        s2: apiData.education?.s2Contract ?? 0,
        s3: apiData.education?.s3Contract ?? 0,
      },
    },
    age: {
      permanent: {
        under25: apiData.age?.under25Permanent ?? 0,
        age26to40: apiData.age?.age26to40Permanent ?? 0,
        age41to50: apiData.age?.age41to50Permanent ?? 0,
        over50: apiData.age?.over50Permanent ?? 0,
      },
      contract: {
        under25: apiData.age?.under25Contract ?? 0,
        age26to40: apiData.age?.age26to40Contract ?? 0,
        age41to50: apiData.age?.age41to50Contract ?? 0,
        over50: apiData.age?.over50Contract ?? 0,
      },
    },
    level: {
      permanent: {
        bod1: apiData.level?.bod1Permanent ?? 0,
        bod2: apiData.level?.bod2Permanent ?? 0,
        bod3: apiData.level?.bod3Permanent ?? 0,
        bod4: apiData.level?.bod4Permanent ?? 0,
      },
      contract: {
        bod1: apiData.level?.bod1Contract ?? 0,
        bod2: apiData.level?.bod2Contract ?? 0,
        bod3: apiData.level?.bod3Contract ?? 0,
        bod4: apiData.level?.bod4Contract ?? 0,
      },
    },
    lengthOfService: {
      permanent: {
        los_0_5: apiData.lengthOfService?.los_0_5_Permanent ?? 0,
        los_6_10: apiData.lengthOfService?.los_6_10_Permanent ?? 0,
        los_11_15: apiData.lengthOfService?.los_11_15_Permanent ?? 0,
        los_16_20: apiData.lengthOfService?.los_16_20_Permanent ?? 0,
        los_21_25: apiData.lengthOfService?.los_21_25_Permanent ?? 0,
        los_25_30: apiData.lengthOfService?.los_25_30_Permanent ?? 0,
        los_over_30: apiData.lengthOfService?.los_over_30_Permanent ?? 0,
      },
      contract: {
        los_0_5: apiData.lengthOfService?.los_0_5_Contract ?? 0,
        los_6_10: apiData.lengthOfService?.los_6_10_Contract ?? 0,
        los_11_15: apiData.lengthOfService?.los_11_15_Contract ?? 0,
        los_16_20: apiData.lengthOfService?.los_16_20_Contract ?? 0,
        los_21_25: apiData.lengthOfService?.los_21_25_Contract ?? 0,
        los_25_30: apiData.lengthOfService?.los_25_30_Contract ?? 0,
        los_over_30: apiData.lengthOfService?.los_over_30_Contract ?? 0,
      },
    },
  };
};

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
    // ## PERUBAHAN 3: Tambahkan state untuk toggle
    const [statusType, setStatusType] = useState<"permanent" | "contract">(
      "permanent"
    );
    const [formData, setFormData] = useState<FormStateData>(initialFormState);
    const [originalData, setOriginalData] = useState<FormStateData | null>(
      null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Efek untuk 'dirty check' (tidak berubah)
    useEffect(() => {
      if (!originalData || !isEditing) {
        onDirtyChange(false);
        return;
      }
      const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
      onDirtyChange(isDirty);
    }, [formData, originalData, onDirtyChange, isEditing]);

    // ## PERUBAHAN 4: Efek untuk fetch data dengan logika baru
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
          const data: DemographyManualInputData = await res.json();
          const transformedData = transformApiDataToFormState(data);
          setFormData(transformedData);
          setOriginalData(transformedData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
          setFormData(initialFormState);
          setOriginalData(initialFormState);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [selectedCompany, period.year, period.value]);

    useEffect(() => {
      if (!isEditing && originalData) {
        setFormData(originalData);
      }
    }, [isEditing, originalData]);

    // ## PERUBAHAN 5: Handle input change dengan struktur state baru
    const handleInputChange = (
      category: keyof FormStateData,
      field: string,
      value: string
    ) => {
      const numValue = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [statusType]: {
            ...prev[category][statusType],
            [field]: numValue,
          },
        },
      }));
    };

    // ## PERUBAHAN 6: Kalkulasi total yang lebih sederhana (derived state)
    const totals = useMemo(() => {
      const sumValues = (obj: { [key: string]: number }) =>
        Object.values(obj).reduce((acc, v) => acc + (v || 0), 0);

      const calculatedTotals: { [key: string]: number } = {};
      for (const category in formData) {
        const cat = category as keyof FormStateData;
        calculatedTotals[cat] =
          sumValues(formData[cat].permanent) +
          sumValues(formData[cat].contract);
      }
      return calculatedTotals;
    }, [formData]);

    // ## PERUBAHAN 7: Fungsi submit dengan payload baru
    const submitForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const payload: DemographyManualInputPayload = {
          year: period.year,
          month: period.value,
          companyId: selectedCompany,
          statusType: statusType,
          headcount: formData.headcount[statusType],
          education: formData.education[statusType],
          age: formData.age[statusType],
          level: formData.level[statusType],
          lengthOfService: formData.lengthOfService[statusType],
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
        alert("Data demografi berhasil disimpan!");
        // Perbarui originalData dengan data saat ini setelah berhasil menyimpan
        setOriginalData(formData);
        onSaveSuccess();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(errorMessage);
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({ submit: submitForm }));

    const renderFieldset = (
      categoryKey: keyof FormStateData,
      legend: string
    ) => {
      const data = formData[categoryKey][statusType];
      return (
        <fieldset className={styles.fieldset} disabled={!isEditing}>
          <legend>{legend}</legend>
          {Object.keys(data).map((key) => (
            <div className={styles.inputGroup} key={key}>
              <label className="capitalize">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace("los", "")
                  .replace(/_/g, "-")}
              </label>
              <input
                type="number"
                min="0"
                value={data[key as keyof typeof data] || 0}
                onChange={(e) =>
                  handleInputChange(categoryKey, key, e.target.value)
                }
              />
            </div>
          ))}
          <div className={styles.inputGroup}>
            <label>Total</label>
            <input
              type="number"
              value={totals[categoryKey] || 0}
              readOnly
              className={styles.readOnly}
            />
          </div>
        </fieldset>
      );
    };

    return (
      <div className={styles.form}>
        {isLoading && (
          <div className={styles.loadingOverlay}>Loading data..</div>
        )}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* ## PERUBAHAN 8: Tambahkan UI Toggle */}
        <div className="mb-4 p-1 bg-gray-200 rounded-lg flex">
          <button
            onClick={() => setStatusType("permanent")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
              statusType === "permanent"
                ? "bg-white text-blue-700 shadow"
                : "text-gray-600"
            }`}
            disabled={!isEditing}
          >
            Permanent
          </button>
          <button
            onClick={() => setStatusType("contract")}
            className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
              statusType === "contract"
                ? "bg-white text-blue-700 shadow"
                : "text-gray-600"
            }`}
            disabled={!isEditing}
          >
            Contract
          </button>
        </div>

        {renderFieldset("headcount", "Headcount")}
        {/* ## PERUBAHAN 9: Hapus fieldset Employee Status */}
        {renderFieldset("education", "Education Level")}
        {renderFieldset("level", "Job Level")}
        {renderFieldset("age", "Age Range")}
        {renderFieldset("lengthOfService", "Length of Service")}
      </div>
    );
  }
);

DemographyForm.displayName = "DemographyForm";
export default DemographyForm;
