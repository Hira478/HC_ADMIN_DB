"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";

// Definisikan tipe data untuk state form
interface FormData {
  year: number;
  month: number;
  companyId: number | string; // Bisa string saat kosong, atau number saat dipilih
  revenue: number;
  netProfit: number;
}

const initialFormData: FormData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  companyId: "",
  revenue: 0,
  netProfit: 0,
};

const InputProductivityPage = () => {
  const { companies, loading: companiesLoading } = useFilters();
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companies.length > 0 && !formData.companyId) {
      setFormData((prev) => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies, formData.companyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === "number";
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Menyimpan data...", type: "loading" });

    try {
      const response = await fetch("/api/ingest-productivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan");
      }
      setStatus({
        message: "Data produktivitas berhasil disimpan!",
        type: "success",
      });
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
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Input Data Productivity</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
          <div>
            <label
              htmlFor="companyId"
              className="block text-sm font-medium text-gray-700"
            >
              Perusahaan
            </label>
            <select
              name="companyId"
              id="companyId"
              value={formData.companyId}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              id="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
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
              id="month"
              value={formData.month}
              onChange={handleChange}
              required
              min="1"
              max="12"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </fieldset>

        <div className="space-y-4 pt-4">
          <div>
            <label
              htmlFor="revenue"
              className="block text-sm font-medium text-gray-700"
            >
              Revenue
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="number"
                name="revenue"
                id="revenue"
                value={formData.revenue}
                onChange={handleChange}
                required
                step="any"
                className="block w-full p-2 pl-8 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="netProfit"
              className="block text-sm font-medium text-gray-700"
            >
              Net Profit
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="number"
                name="netProfit"
                id="netProfit"
                value={formData.netProfit}
                onChange={handleChange}
                required
                step="any"
                className="block w-full p-2 pl-8 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Data Productivity"}
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

export default InputProductivityPage;
