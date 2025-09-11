// components/tables/FormationRasioTable.tsx
"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import InfoTooltip from "@/components/ui/InfoTooltip";

// Tipe untuk setiap baris data yang diterima dari API
interface TableRow {
  jobFamily: string;
  rasio: string;
  market: string;
  statusRatio: number;
}

// Tipe untuk props komponen utama
interface TableProps {
  data: TableRow[];
  meta: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  title: string;
  subtitle: string;
  isLoading: boolean;
}

// Logika untuk menentukan status berdasarkan perbandingan rasio vs market
const getStatusInfo = (statusRatio: number) => {
  if (statusRatio > 110) {
    return { text: "🔵 Overstaffed", className: "bg-blue-100 text-blue-800" };
  } else if (statusRatio >= 90) {
    return { text: "🟢 Fit", className: "bg-green-100 text-green-800" };
  } else if (statusRatio >= 80) {
    return { text: "🟠 Need", className: "bg-orange-100 text-orange-800" };
  } else if (statusRatio >= 70) {
    return { text: "🔴 Urgently Need", className: "bg-red-100 text-red-800" };
  } else if (statusRatio > 0) {
    return {
      text: "🚨 Critical Gap",
      className: "bg-red-200 text-red-900 font-bold",
    };
  }
  return { text: "-", className: "bg-gray-100 text-gray-800" };
};

// Komponen Paginasi yang Fungsional
const Pagination: React.FC<Pick<TableProps, "meta" | "onPageChange">> = ({
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* ...isi pagination tidak berubah... */}
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
const FormationRasioTable: React.FC<TableProps> = ({
  data,
  meta,
  onPageChange,
  title,
  subtitle,
  isLoading,
}) => {
  return (
    // --- PERUBAHAN DI BAWAH INI ---
    // 1. Hapus 'style' prop yang berisi minHeight: 490px
    // 2. Tambahkan 'h-full' ke className agar mengisi tinggi parent (yang sudah di-stretch)
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <InfoTooltip content="Tabel ini membandingkan rasio komposisi karyawan per Job Family dengan benchmark pasar di industri sejenis." />
      </div>

      {isLoading ? (
        // flex-grow akan memastikan ini mengisi sisa ruang
        <div className="flex-grow flex justify-center items-center">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* flex-grow akan memastikan ini mengisi sisa ruang */}
          <div className="overflow-x-auto flex-grow">
            <table className="min-w-full">
              {/* --- PERUBAHAN UTAMA DI SINI --- */}
              {/* 1. Tambahkan background abu-abu ke thead */}
              <thead>
                <tr className="border-b">
                  {/* 2. Ubah style text header agar lebih 'label-like' */}
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">
                    Job Family
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">
                    Rasio
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">
                    Market
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {/* 3. Pastikan tbody memiliki background putih (jika diperlukan) */}
                {data && data.length > 0 ? (
                  data.map((row) => {
                    const statusInfo = getStatusInfo(row.statusRatio);
                    return (
                      <tr
                        key={row.jobFamily}
                        className="border-b hover:bg-gray-50"
                      >
                        {/* Style data row (font-medium) sekarang akan kontras dengan header */}
                        <td className="p-4 text-gray-800 font-medium">
                          {row.jobFamily}
                        </td>
                        <td className="p-4 text-gray-800">{row.rasio}</td>
                        <td className="p-4 text-gray-800">{row.market}</td>
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
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      No data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination akan otomatis menempel di bawah */}
          <Pagination meta={meta} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
};

export default FormationRasioTable;
