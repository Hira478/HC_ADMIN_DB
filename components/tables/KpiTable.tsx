"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useFilters } from "@/contexts/FilterContext";
import QuarterScoreCard from "@/components/widgets/QuarterScoreCard";

// Tipe Data
interface KpiDetail {
  id: number;
  year: number;
  quarter: number;
  kpiName: string;
  kpiCategory: string;
  weight: number;
  achievementScore: number;
}

interface QuarterlySummary {
  quarter: string;
  score: number;
}

interface KpiData {
  quarterlySummary: QuarterlySummary[];
  kpiDetails: KpiDetail[];
}

// Fungsi Helper
const calculateAdjustedSkorCapaian = (skor: number): number => {
  if (skor > 1.1) return 1.1;
  if (skor < 0) return 0;
  return skor;
};

const formatAsPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Komponen Paginasi
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push("...");
      if (currentPage > 2) items.push(currentPage - 1);
      if (currentPage > 1 && currentPage < totalPages) items.push(currentPage);
      if (currentPage < totalPages - 1) items.push(currentPage + 1);
      if (currentPage < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return Array.from(new Set(items));
  };

  const pageItems = getPaginationItems();

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      {pageItems.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(item)}
            className={`px-3 py-1 rounded-md text-sm ${
              item === currentPage
                ? "bg-gray-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={index} className="px-3 py-1 text-sm text-gray-400">
            ...
          </span>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

// Komponen Utama
const KpiTable = () => {
  const { selectedCompany, period } = useFilters();
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [activeQuarter, setActiveQuarter] = useState<number | null>(null);

  useEffect(() => {
    if (period.type === "monthly" && period.value) {
      setActiveQuarter(Math.ceil(period.value / 3));
    } else if (period.type === "quarterly" && period.value) {
      setActiveQuarter(period.value);
    } else {
      setActiveQuarter(null);
    }
  }, [period]);

  const handleQuarterCardClick = (quarterNumber: number) => {
    setActiveQuarter(quarterNumber);
  };

  useEffect(() => {
    if (!selectedCompany || !period?.year) {
      setLoading(false);
      setKpiData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          companyId: String(selectedCompany),
          year: String(period.year),
        });
        const response = await fetch(`/api/kpi/quartal?${params.toString()}`);
        if (!response.ok) throw new Error("Gagal mengambil data KPI");
        const data = await response.json();
        setKpiData(data);
      } catch (error) {
        console.error(error);
        setKpiData({ quarterlySummary: [], kpiDetails: [] });
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };
    fetchData();
  }, [selectedCompany, period]);

  const tableTitle = useMemo(() => {
    if (activeQuarter) return `KPI Details Q${activeQuarter}`;
    return "KPI Details";
  }, [activeQuarter]);

  const filteredKpiDetails = useMemo(() => {
    const allDetails = kpiData?.kpiDetails || [];
    if (activeQuarter === null) return allDetails;
    return allDetails.filter((item) => item.quarter === activeQuarter);
  }, [kpiData, activeQuarter]);

  const tableTotalScore = useMemo(() => {
    return filteredKpiDetails.reduce((sum, item) => {
      const adjustedScore = calculateAdjustedSkorCapaian(item.achievementScore);
      return sum + item.weight * adjustedScore;
    }, 0);
  }, [filteredKpiDetails]);

  const totalPages = Math.ceil(
    (filteredKpiDetails.length || 0) / ITEMS_PER_PAGE
  );

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKpiDetails.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredKpiDetails]);

  const placeholderCount = useMemo(() => {
    const isLastPage = currentPage === totalPages;
    if (
      isLastPage &&
      currentItems.length > 0 &&
      currentItems.length < ITEMS_PER_PAGE
    ) {
      return ITEMS_PER_PAGE - currentItems.length;
    }
    return 0;
  }, [currentItems, currentPage, totalPages]);

  const allQuarters = ["Q1", "Q2", "Q3", "Q4"];

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Memuat Data KPI...</div>
    );
  }

  if (!kpiData) {
    return (
      <div className="p-10 text-center bg-yellow-100 text-yellow-800 rounded-lg">
        Silakan pilih perusahaan dan periode untuk menampilkan data.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {tableTitle.replace("Details", "Score")}
        </h3>
        <div className="flex flex-col flex-grow gap-4">
          {allQuarters.map((quarterName, index) => {
            const quarterNumber = index + 1;
            const quarterData = kpiData.quarterlySummary.find(
              (s) => s.quarter === quarterName
            );
            return (
              <QuarterScoreCard
                key={quarterName}
                quarter={quarterName}
                score={quarterData?.score}
                isPlaceholder={!quarterData}
                onClick={() => handleQuarterCardClick(quarterNumber)}
                className={
                  quarterData
                    ? quarterData.score > 100
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-800 text-white"
                    : ""
                }
              />
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-between">
          {filteredKpiDetails.length > 0 ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{tableTitle}</h3>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="text-sm font-semibold">Total Score:</span>
                    <span className="text-lg font-bold">
                      {formatAsPercentage(tableTotalScore)}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-gray-100">
                        {/* --- PERUBAHAN 2: Atur lebar kolom secara eksplisit --- */}
                        <th className="p-3 font-semibold text-sm w-14 text-center">
                          No.
                        </th>
                        <th className="p-3 font-semibold text-sm w-[40%]">
                          KPI
                        </th>
                        <th className="p-3 font-semibold text-sm w-[25%]">
                          Kategori
                        </th>
                        <th className="p-3 font-semibold text-sm text-right">
                          Bobot
                        </th>
                        <th className="p-3 font-semibold text-sm text-right">
                          Skor Capaian
                        </th>
                        <th className="p-3 font-semibold text-sm text-right">
                          Skor Akhir
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => {
                        const adjustedSkorCapaian =
                          calculateAdjustedSkorCapaian(item.achievementScore);
                        const skorAkhir = item.weight * adjustedSkorCapaian;
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 hover:bg-gray-50 h-[60px]"
                          >
                            <td className="p-3 text-center text-gray-500">
                              {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            </td>
                            <td className="p-3">
                              <div className="truncate" title={item.kpiName}>
                                {item.kpiName}
                              </div>
                            </td>
                            {/* --- PERUBAHAN 2: Terapkan truncate pada kolom Kategori --- */}
                            <td className="p-3">
                              <div
                                className="truncate"
                                title={item.kpiCategory}
                              >
                                {item.kpiCategory}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              {formatAsPercentage(item.weight)}
                            </td>
                            <td className="p-3 text-right">
                              {formatAsPercentage(adjustedSkorCapaian)}
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatAsPercentage(skorAkhir)}
                            </td>
                          </tr>
                        );
                      })}
                      {placeholderCount > 0 &&
                        Array.from({ length: placeholderCount }).map(
                          (_, index) => (
                            <tr
                              key={`placeholder-${index}`}
                              className="border-b border-gray-200 h-[60px]"
                            >
                              <td colSpan={6} className="p-3">
                                &nbsp;
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="p-10 text-center bg-yellow-100 text-yellow-800 rounded-lg h-full flex items-center justify-center">
              Tidak ada data detail KPI untuk periode yang dipilih.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiTable;
