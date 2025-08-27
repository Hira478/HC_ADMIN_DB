"use client";
import { Company } from "@/types";
import React, { useState, useEffect, useMemo } from "react";

// 10 Kategori baru sesuai skema
const INDICATORS = [
  { id: "rd", label: "R&D" },
  { id: "business", label: "Business" },
  { id: "finance", label: "Finance" },
  { id: "humanResources", label: "Human Resources" },
  { id: "actuary", label: "Actuary" },
  { id: "compliance", label: "Compliance" },
  { id: "legal", label: "Legal" },
  { id: "informationTechnology", label: "IT" },
  { id: "corporateSecretary", label: "Corporate Secretary" },
  { id: "generalAffairs", label: "General Affairs" },
];

interface FormProps {
  companies: Company[];
}

const FormationRasioForm: React.FC<FormProps> = ({ companies }) => {
  // State untuk form submission
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State untuk data form
  const [formData, setFormData] = useState({
    companyId: "",
    year: new Date().getFullYear().toString(),
    month: "1", // Default ke Januari
    ...Object.fromEntries(INDICATORS.map((i) => [i.id, ""])),
  });

  // State untuk menampung total headcount dari API
  const [totalHeadcount, setTotalHeadcount] = useState<number | null>(null);
  const [isHeadcountLoading, setIsHeadcountLoading] = useState(false);

  // Tambahkan komentar ini untuk menonaktifkan warning pada baris berikutnya
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const { companyId, year, month } = formData;
    if (companyId && year && month) {
      setIsHeadcountLoading(true);
      setTotalHeadcount(null);
      const fetchHeadcount = async () => {
        try {
          const res = await fetch(
            `/api/headcount/total?companyId=${companyId}&year=${year}&month=${month}`
          );
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Gagal mengambil data headcount");
          setTotalHeadcount(data.totalHeadcount);
        } catch (error) {
          console.error("Failed to fetch headcount", error);
          setTotalHeadcount(0);
        } finally {
          setIsHeadcountLoading(false);
        }
      };
      fetchHeadcount();
    }
  }, [formData.companyId, formData.year, formData.month]);

  // Menghitung total input dari 10 field secara real-time
  const currentInputTotal = useMemo(() => {
    return INDICATORS.reduce((sum, indicator) => {
      const value =
        parseInt(formData[indicator.id as keyof typeof formData]) || 0;
      return sum + value;
    }, 0);
  }, [formData]);

  // Cek apakah total input tidak cocok dengan total headcount
  const isTotalMismatch =
    totalHeadcount !== null && currentInputTotal !== totalHeadcount;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/input/formation-rasio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");
      setMessage(`Sukses! ${result.message}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    name: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="companyId"
            className="block text-sm font-medium text-gray-700"
          >
            Perusahaan
          </label>
          <select
            id="companyId"
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Pilih Perusahaan</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Tahun
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700"
          >
            Bulan
          </label>
          <select
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menampilkan Total Headcount Referensi */}
      {(isHeadcountLoading || totalHeadcount !== null) && (
        <div className="p-4 bg-gray-50 rounded-md text-center border">
          {isHeadcountLoading ? (
            <p className="text-gray-600 animate-pulse">
              Mencari Total Headcount...
            </p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">Total Headcount Referensi</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalHeadcount}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-medium text-gray-900">
            Input Pembagian Staff
          </h3>
          {totalHeadcount !== null && (
            <div
              className={`text-sm font-medium p-2 rounded-md ${
                isTotalMismatch
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Total Input: {currentInputTotal} / {totalHeadcount}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
          {INDICATORS.map((indicator) => (
            <div key={indicator.id}>
              <label
                htmlFor={indicator.id}
                className="block text-sm font-medium text-gray-700"
              >
                {indicator.label}
              </label>
              <input
                type="number"
                step="1"
                id={indicator.id}
                name={indicator.id}
                value={formData[indicator.id as keyof typeof formData]}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || isTotalMismatch}
          className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menyimpan..." : "Simpan Data Formation Rasio"}
        </button>
        {isTotalMismatch && (
          <p className="text-center text-red-600 text-sm mt-2">
            Total input ({currentInputTotal}) harus sama dengan Total Headcount
            Referensi ({totalHeadcount}).
          </p>
        )}
      </div>
      {message && (
        <p
          className={`mt-4 text-sm font-medium text-center ${
            message.startsWith("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default FormationRasioForm;
