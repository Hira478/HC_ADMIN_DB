"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

// Tipe untuk setiap baris data
interface TableRow {
  division: string;
  manPowerPlanning: number;
  headcount: number;
  rasio: string;
  status?: "Stretch" | "Fit" | "Overload"; // Status dibuat opsional
}

// Tipe untuk props komponen utama
interface TableProps {
  data: TableRow[];
  meta: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

// Fungsi logika baru untuk menentukan Status dan warnanya
const getStatusInfo = (rasioString: string) => {
  const rasio = parseFloat(rasioString); // "94%" -> 94

  if (rasio > 100) {
    return {
      text: "🔵 Overstaffed",
      className: "bg-blue-100 text-blue-800",
    };
  } else if (rasio >= 90) {
    // Mencakup 90-100%
    return {
      text: "🟢 Fit",
      className: "bg-green-100 text-green-800",
    };
  } else if (rasio >= 80) {
    // Mencakup 80-89%
    return {
      text: "🟠 Need",
      className: "bg-orange-100 text-orange-800",
    };
  } else if (rasio >= 70) {
    // Mencakup 70-79%
    return {
      text: "🔴 Urgently Need",
      className: "bg-red-100 text-red-800",
    };
  } else if (rasio > 0) {
    // Mencakup > 0 dan < 70%
    return {
      text: "🚨 Critical Gap",
      className: "bg-red-200 text-red-900 font-bold", // Dibuat lebih menonjol
    };
  }

  // Default untuk rasio 0% atau nilai tidak valid lainnya
  return {
    text: "-",
    className: "bg-gray-100 text-gray-800",
  };
};

// Komponen Paginasi yang Fungsional
const Pagination: React.FC<Omit<TableProps, "data">> = ({
  meta,
  onPageChange,
}) => {
  const { currentPage, totalPages } = meta;

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

// Komponen Tabel Utama
const WorkforcePlanningTable: React.FC<TableProps> = ({
  data,
  meta,
  onPageChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Manpower Planning vs Headcount
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left font-semibold text-gray-600 p-4">
                Division
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Manpower Planning
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Headcount
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Rasio
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => {
                const statusInfo = getStatusInfo(row.rasio);

                return (
                  <tr key={row.division} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-medium">
                      {row.division}
                    </td>
                    <td className="p-4 text-gray-800">
                      {row.manPowerPlanning}
                    </td>
                    <td className="p-4 text-gray-800">{row.headcount}</td>
                    <td className="p-4 text-gray-800">{row.rasio}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  Data not found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default WorkforcePlanningTable;
