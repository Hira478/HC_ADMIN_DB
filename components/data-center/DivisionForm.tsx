// File: components/data-center/DivisionForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";
import { DivisionStat } from "@prisma/client";

// Simple debounce hook untuk menunda pencarian
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

interface DivisionFormProps {
  selectedCompany: number;
  period: Period;
}

interface DivisionData {
  data: DivisionStat[];
  meta: { total: number; page: number; totalPages: number };
}

export default function DivisionForm({
  selectedCompany,
  period,
}: DivisionFormProps) {
  const [divisionData, setDivisionData] = useState<DivisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/data-center/divisions?year=${period.year}&month=${period.value}&companyId=${selectedCompany}&page=${page}&search=${debouncedSearchTerm}`
      );
      if (!res.ok) throw new Error("Failed to fetch division data.");
      const data = await res.json();
      setDivisionData(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany, period.year, period.value, page, debouncedSearchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleActualCountChange = async (id: number, value: string) => {
    const actualCount = parseInt(value) || 0;
    // Update UI langsung untuk respons instan
    setDivisionData((current) => {
      if (!current) return null;
      return {
        ...current,
        data: current.data.map((d) =>
          d.id === id ? { ...d, actualCount } : d
        ),
      };
    });
    // Kirim pembaruan ke backend
    await fetch("/api/data-center/divisions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actualCount }),
    });
  };

  return (
    <div className={styles.form}>
      <p className={styles.formDescription}>
        Data MPP (Planned) diisi melalui Bulk Upload. Silakan isi Headcount
        Aktual di tabel di bawah ini. Perubahan akan tersimpan otomatis saat
        Anda keluar dari kolom input.
      </p>
      <div className={styles.tableControls}>
        <input
          type="text"
          placeholder="Search Division Name..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>Loading Divisions...</div>
      )}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Division Name</th>
              <th>MPP (Planned)</th>
              <th>Actual Headcount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {divisionData?.data.map((div) => (
              <tr key={div.id}>
                <td>{div.divisionName}</td>
                <td>{div.plannedCount}</td>
                <td>
                  <input
                    type="number"
                    className={styles.tableInput}
                    defaultValue={div.actualCount}
                    onBlur={(e) =>
                      handleActualCountChange(div.id, e.target.value)
                    }
                  />
                </td>
                <td>
                  {div.actualCount === div.plannedCount
                    ? "✅ Sesuai"
                    : div.actualCount > div.plannedCount
                    ? "🔺 Lebih"
                    : "🔻 Kurang"}
                </td>
              </tr>
            ))}
            {divisionData?.data.length === 0 && (
              <tr>
                <td colSpan={4}>
                  No division data found for this period. Please upload the MPP
                  template.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {divisionData?.meta.page || 1} of{" "}
          {divisionData?.meta.totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!divisionData || page === divisionData.meta.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
