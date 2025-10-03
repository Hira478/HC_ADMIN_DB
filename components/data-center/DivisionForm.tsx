"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "@/app/(dashboard)/data-center/DataCenter.module.css";
import type { Period } from "@/contexts/FilterContext";
import { DivisionStat } from "@prisma/client";
import AppModal from "@/components/ui/AppModal";

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

const CATEGORIES = [
  "Business",
  "Compliance",
  "Finance",
  "HC, GA & Sekper",
  "IT",
  "Operation",
  "Strategy",
  "Uncategorized",
];

interface DivisionFormProps {
  selectedCompany: number;
  period: Period;
  isEditing: boolean;
}

interface DivisionData {
  data: DivisionStat[];
  meta: { total: number; page: number; totalPages: number };
}

export default function DivisionForm({
  selectedCompany,
  period,
  isEditing,
}: DivisionFormProps) {
  const [divisionData, setDivisionData] = useState<DivisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDivision, setNewDivision] = useState({
    divisionName: "",
    plannedCount: 0,
    Kategori: "Uncategorized",
  });

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
    setDivisionData((current) => {
      if (!current) return null;
      return {
        ...current,
        data: current.data.map((d) =>
          d.id === id ? { ...d, actualCount } : d
        ),
      };
    });
    await fetch(`/api/data-center/divisions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actualCount }),
    });
  };

  const openAddDivisionModal = () => {
    setNewDivision({
      divisionName: "",
      plannedCount: 0,
      Kategori: "Uncategorized",
    });
    setIsModalOpen(true);
  };

  const handleSaveNewDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivision.divisionName) {
      alert("Division Name is required.");
      return;
    }

    const payload = {
      ...newDivision,
      year: period.year,
      month: period.value,
      companyId: selectedCompany,
      actualCount: 0,
    };

    const res = await fetch("/api/data-center/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Failed to add division.");
    }
  };

  const handleDeleteDivision = async (id: number, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete division "${name}" for this period?`
      )
    ) {
      const res = await fetch(`/api/data-center/divisions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Optimistic update: remove from UI immediately
        setDivisionData((current) =>
          current
            ? { ...current, data: current.data.filter((d) => d.id !== id) }
            : null
        );
      } else {
        alert("Failed to delete division.");
      }
    }
  };

  return (
    <div className={styles.form}>
      {isEditing && (
        <div className={styles.tableControls}>
          <button onClick={openAddDivisionModal} className={styles.addButton}>
            + Add Division
          </button>
        </div>
      )}
      <div className={styles.tableControls}>
        <input
          type="text"
          placeholder="Search Division Name..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!isEditing && divisionData?.data.length === 0}
        />
        {/* PENAMBAHAN: Indikator total divisi */}
        <div className={styles.totalIndicator}>
          Total Divisions: <strong>{divisionData?.meta.total || 0}</strong>
        </div>
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
              <th>Category</th>
              <th>MPP (Planned)</th>
              <th>Actual Headcount</th>
              {isEditing && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {divisionData &&
              divisionData.data.map((div) => (
                <tr key={div.id}>
                  <td>{div.divisionName}</td>
                  <td>{div.Kategori}</td>
                  <td>{div.plannedCount}</td>
                  <td>
                    <input
                      type="number"
                      className={styles.tableInput}
                      defaultValue={div.actualCount}
                      onBlur={(e) =>
                        handleActualCountChange(div.id, e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </td>
                  {isEditing && (
                    <td>
                      <button
                        onClick={() =>
                          handleDeleteDivision(div.id, div.divisionName)
                        }
                        className={styles.deleteButton}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            {divisionData?.data.length === 0 && !isLoading && (
              <tr>
                <td colSpan={isEditing ? 4 : 3}>
                  No division data found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <AppModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Division"
        >
          <form onSubmit={handleSaveNewDivision}>
            <div className={styles.inputGroup}>
              <label>Division Name</label>
              <input
                type="text"
                value={newDivision.divisionName}
                onChange={(e) =>
                  setNewDivision({
                    ...newDivision,
                    divisionName: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>MPP (Planned Count)</label>
              <input
                type="number"
                min="0"
                value={newDivision.plannedCount}
                onChange={(e) =>
                  setNewDivision({
                    ...newDivision,
                    plannedCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Category</label>
              <select
                value={newDivision.Kategori}
                onChange={(e) =>
                  setNewDivision({ ...newDivision, Kategori: e.target.value })
                }
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitButton}>
                Save Division
              </button>
            </div>
          </form>
        </AppModal>
      </div>
      <div className={styles.pagination}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <span>
          Page {divisionData?.meta.page || 1} of{" "}
          {divisionData?.meta.totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={
            !divisionData || page === divisionData.meta.totalPages || isLoading
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
