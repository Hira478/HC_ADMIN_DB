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
  permanent: {
    sd: number;
    smp: number;
    smaSmk: number;
    d1: number;
    d2: number;
    d3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  contract: {
    sd: number;
    smp: number;
    smaSmk: number;
    d1: number;
    d2: number;
    d3: number;
    s1: number;
    s2: number;
    s3: number;
  };
}
interface LevelState {
  permanent: {
    bod1: number;
    bod2: number;
    bod3: number;
    bod4: number;
    bod5: number;
  };
  contract: {
    bod1: number;
    bod2: number;
    bod3: number;
    bod4: number;
    bod5: number;
  };
}
interface AgeState {
  permanent: {
    under25: number;
    age26to40: number;
    age41to50: number;
    age51to60: number;
    over60: number;
  };
  contract: {
    under25: number;
    age26to40: number;
    age41to50: number;
    age51to60: number;
    over60: number;
  };
}
interface LosState {
  permanent: {
    los_under_5: number;
    los_5_to_10: number;
    los_11_to_15: number;
    los_16_to_20: number;
    los_over_25: number;
  };
  contract: {
    los_under_5: number;
    los_5_to_10: number;
    los_11_to_15: number;
    los_16_to_20: number;
    los_over_25: number;
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
    permanent: {
      sd: 0,
      smp: 0,
      smaSmk: 0,
      d1: 0,
      d2: 0,
      d3: 0,
      s1: 0,
      s2: 0,
      s3: 0,
    },
    contract: {
      sd: 0,
      smp: 0,
      smaSmk: 0,
      d1: 0,
      d2: 0,
      d3: 0,
      s1: 0,
      s2: 0,
      s3: 0,
    },
  },
  level: {
    permanent: { bod1: 0, bod2: 0, bod3: 0, bod4: 0, bod5: 0 },
    contract: { bod1: 0, bod2: 0, bod3: 0, bod4: 0, bod5: 0 },
  },
  age: {
    permanent: {
      under25: 0,
      age26to40: 0,
      age41to50: 0,
      age51to60: 0,
      over60: 0,
    },
    contract: {
      under25: 0,
      age26to40: 0,
      age41to50: 0,
      age51to60: 0,
      over60: 0,
    },
  },
  lengthOfService: {
    permanent: {
      los_under_5: 0,
      los_5_to_10: 0,
      los_11_to_15: 0,
      los_16_to_20: 0,
      los_over_25: 0,
    },
    contract: {
      los_under_5: 0,
      los_5_to_10: 0,
      los_11_to_15: 0,
      los_16_to_20: 0,
      los_over_25: 0,
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
        sd: apiData.education?.sdPermanent ?? 0,
        smp: apiData.education?.smpPermanent ?? 0,
        smaSmk: apiData.education?.smaSmkPermanent ?? 0,
        d1: apiData.education?.d1Permanent ?? 0,
        d2: apiData.education?.d2Permanent ?? 0,
        d3: apiData.education?.d3Permanent ?? 0,
        s1: apiData.education?.s1Permanent ?? 0,
        s2: apiData.education?.s2Permanent ?? 0,
        s3: apiData.education?.s3Permanent ?? 0,
      },
      contract: {
        sd: apiData.education?.sdContract ?? 0,
        smp: apiData.education?.smpContract ?? 0,
        smaSmk: apiData.education?.smaSmkContract ?? 0,
        d1: apiData.education?.d1Contract ?? 0,
        d2: apiData.education?.d2Contract ?? 0,
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
        age51to60: apiData.age?.age51to60Permanent ?? 0, // <-- Diubah
        over60: apiData.age?.over60Permanent ?? 0,
      },
      contract: {
        under25: apiData.age?.under25Contract ?? 0,
        age26to40: apiData.age?.age26to40Contract ?? 0,
        age41to50: apiData.age?.age41to50Contract ?? 0,
        age51to60: apiData.age?.age51to60Contract ?? 0, // <-- Diubah
        over60: apiData.age?.over60Contract ?? 0,
      },
    },
    level: {
      permanent: {
        bod1: apiData.level?.bod1Permanent ?? 0,
        bod2: apiData.level?.bod2Permanent ?? 0,
        bod3: apiData.level?.bod3Permanent ?? 0,
        bod4: apiData.level?.bod4Permanent ?? 0,
        bod5: apiData.level?.bod5Permanent ?? 0,
      },
      contract: {
        bod1: apiData.level?.bod1Contract ?? 0,
        bod2: apiData.level?.bod2Contract ?? 0,
        bod3: apiData.level?.bod3Contract ?? 0,
        bod4: apiData.level?.bod4Contract ?? 0,
        bod5: apiData.level?.bod5Contract ?? 0,
      },
    },
    // Kode Baru
    lengthOfService: {
      permanent: {
        los_under_5: apiData.lengthOfService?.los_under_5_Permanent ?? 0,
        los_5_to_10: apiData.lengthOfService?.los_5_to_10_Permanent ?? 0,
        los_11_to_15: apiData.lengthOfService?.los_11_to_15_Permanent ?? 0,
        los_16_to_20: apiData.lengthOfService?.los_16_to_20_Permanent ?? 0,
        los_over_25: apiData.lengthOfService?.los_over_25_Permanent ?? 0,
      },
      contract: {
        los_under_5: apiData.lengthOfService?.los_under_5_Contract ?? 0,
        los_5_to_10: apiData.lengthOfService?.los_5_to_10_Contract ?? 0,
        los_11_to_15: apiData.lengthOfService?.los_11_to_15_Contract ?? 0,
        los_16_to_20: apiData.lengthOfService?.los_16_to_20_Contract ?? 0,
        los_over_25: apiData.lengthOfService?.los_over_25_Contract ?? 0,
      },
    },
  };
};

const formatLabel = (key: string): string => {
  const labelMap: { [key: string]: string } = {
    // Age
    under25: "<=30 Years Old",
    age26to40: "31-40 Years Old",
    age41to50: "41-50 Years Old",
    age51to60: "51-60 Years Old",
    over60: ">60 Years Old",
    // Level
    bod5: "BOD-4 >",
    // Education
    smaSmk: "SMA",
    // Length of Service
    los_under_5: "<5",
    los_5_to_10: "5-10",
    los_11_to_15: "11-15",
    los_16_to_20: "16-20",
    los_over_25: ">25",
    // Headcount
    male: "Male",
    female: "Female",
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  // Logika fallback untuk format lain (seperti los_0_5, bod1, dll)
  if (key.startsWith("los_")) {
    return key.replace("los_", "").replace(/_/g, "-");
  }

  return key.replace("bod", "BOD-").toUpperCase();
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
      status: "permanent" | "contract",
      field: string,
      value: string
    ) => {
      const numValue = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [status]: { ...prev[category][status], [field]: numValue },
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

      const createPayload = (
        statusType: "permanent" | "contract"
      ): DemographyManualInputPayload => ({
        year: period.year,
        month: period.value,
        companyId: selectedCompany,
        statusType: statusType,
        headcount: formData.headcount[statusType],
        education: formData.education[statusType],
        age: formData.age[statusType],
        level: formData.level[statusType],
        lengthOfService: formData.lengthOfService[statusType],
      });

      try {
        const permanentPayload = createPayload("permanent");
        const contractPayload = createPayload("contract");

        // --- KIRIM PERMANENT DULU ---
        const permanentResponse = await fetch("/api/data-center/demography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permanentPayload),
        });

        if (!permanentResponse.ok) {
          const errorData = await permanentResponse.json();
          throw new Error(errorData.error || "Gagal menyimpan data Permanent.");
        }

        // --- SETELAH PERMANENT SUKSES, KIRIM CONTRACT ---
        const contractResponse = await fetch("/api/data-center/demography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractPayload),
        });

        if (!contractResponse.ok) {
          const errorData = await contractResponse.json();
          throw new Error(errorData.error || "Gagal menyimpan data Contract.");
        }

        alert("Data demografi (Permanent & Contract) berhasil disimpan!");
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

    const renderInputGroup = (
      category: keyof FormStateData,
      status: "permanent" | "contract"
    ) => {
      const data = formData[category][status];
      return (
        <div>
          <h4 className="font-semibold text-gray-600 mb-2 capitalize">
            {status}
          </h4>
          <div className="space-y-2">
            {Object.keys(data).map((key) => (
              <div className={styles.inputGroup} key={`${status}-${key}`}>
                <label>{formatLabel(key)}</label>
                <input
                  type="number"
                  min="0"
                  value={data[key as keyof typeof data] || 0}
                  onChange={(e) =>
                    handleInputChange(category, status, key, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className={styles.form}>
        {isLoading && (
          <div className={styles.loadingOverlay}>Loading data..</div>
        )}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {(
          [
            "headcount",
            "education",
            "age",
            "level",
            "lengthOfService",
          ] as (keyof FormStateData)[]
        ).map((cat) => (
          <fieldset key={cat} className={styles.fieldset} disabled={!isEditing}>
            <legend className="capitalize">
              {cat.replace(/([A-Z])/g, " $1").replace("Stat", "")}
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {renderInputGroup(cat, "permanent")}
              {renderInputGroup(cat, "contract")}
            </div>
            <div className={`mt-4 pt-4 border-t ${styles.inputGroup}`}>
              <label className="font-bold">Total</label>
              <input
                type="number"
                value={totals[cat] || 0}
                readOnly
                className={styles.readOnly}
              />
            </div>
          </fieldset>
        ))}
      </div>
    );
  }
);

DemographyForm.displayName = "DemographyForm";
export default DemographyForm;
