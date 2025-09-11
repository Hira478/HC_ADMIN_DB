"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";

// Definisikan tipe data untuk state form agar lebih aman
interface FormData {
  year: number;
  month: number;
  companyId: number | string; // Bisa string saat kosong, atau number saat dipilih
  maleCount: number;
  femaleCount: number;
  permanentCount: number;
  contractCount: number;
  smaSmkCount: number;
  d3Count: number;
  s1Count: number;
  s2Count: number;
  s3Count: number;
}

const initialFormData: FormData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  companyId: "", // Awalnya string kosong
  maleCount: 0,
  femaleCount: 0,
  permanentCount: 0,
  contractCount: 0,
  smaSmkCount: 0,
  d3Count: 0,
  s1Count: 0,
  s2Count: 0,
  s3Count: 0,
};

const DataInputPage = () => {
  const { companies, loading: companiesLoading } = useFilters();
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companies.length > 0) {
      setFormData((prev) => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === "number";
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Menyimpan data...", type: "loading" });

    try {
      const response = await fetch("/api/ingest-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan");
      }
      setStatus({ message: "Data berhasil disimpan!", type: "success" });
    } catch (error) {
      // <-- Perbaikan di sini, hapus ': any'
      // Tambahkan pengecekan tipe error
      if (error instanceof Error) {
        setStatus({ message: `Error: ${error.message}`, type: "error" });
      } else {
        setStatus({
          message: "Terjadi error yang tidak diketahui.",
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Input Data Bulanan</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        {/* -- Bagian Periode & Perusahaan -- */}
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="companyId"
              className="block text-sm font-medium text-gray-700"
            >
              Perusahaan
            </label>
            <select
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              {companiesLoading ? (
                <option>Loading...</option>
              ) : (
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700"
            >
              Tahun
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="month"
              className="block text-sm font-medium text-gray-700"
            >
              Bulan (1-12)
            </label>
            <input
              type="number"
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              min="1"
              max="12"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </fieldset>

        {/* -- Bagian Headcount -- */}
        <fieldset className="border-t pt-4">
          <legend className="text-lg font-semibold text-gray-900">
            Headcount
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label
                htmlFor="maleCount"
                className="block text-sm font-medium text-gray-700"
              >
                Jumlah Pria
              </label>
              <input
                type="number"
                name="maleCount"
                value={formData.maleCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="femaleCount"
                className="block text-sm font-medium text-gray-700"
              >
                Jumlah Wanita
              </label>
              <input
                type="number"
                name="femaleCount"
                value={formData.femaleCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* -- Bagian Edukasi -- */}
        <fieldset className="border-t pt-4">
          <legend className="text-lg font-semibold text-gray-900">
            Edukasi
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <label
                htmlFor="smaSmkCount"
                className="block text-sm font-medium text-gray-700"
              >
                SMA/SMK
              </label>
              <input
                type="number"
                name="smaSmkCount"
                value={formData.smaSmkCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="d3Count"
                className="block text-sm font-medium text-gray-700"
              >
                D3
              </label>
              <input
                type="number"
                name="d3Count"
                value={formData.d3Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="s1Count"
                className="block text-sm font-medium text-gray-700"
              >
                S1
              </label>
              <input
                type="number"
                name="s1Count"
                value={formData.s1Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Data"}
        </button>

        {status.message && (
          <div
            className={`p-3 rounded-md text-center text-sm ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : status.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default DataInputPage;
