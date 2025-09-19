// File: app/(dashboard)/input/rkap/page.tsx
"use client";

import { useFilters } from "@/contexts/FilterContext";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";

// Tipe data untuk state form
interface RkapFormData {
  year: number;
  companyId: string;
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
}

const EMPTY_FORM_STATE: RkapFormData = {
  year: new Date().getFullYear(),
  companyId: "",
  revenue: 0,
  netProfit: 0,
  totalEmployeeCost: 0,
};

export default function RkapInputPage() {
  const { user, companies } = useFilters();
  const [formData, setFormData] = useState<RkapFormData>(EMPTY_FORM_STATE);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set companyId default
  useEffect(() => {
    if (user?.role === "USER_ANPER") {
      setFormData((prev) => ({
        ...prev,
        companyId: user.companyId.toString(),
      }));
    } else if (companies.length > 0 && !formData.companyId) {
      setFormData((prev) => ({
        ...prev,
        companyId: companies[0].id.toString(),
      }));
    }
  }, [user, companies]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Menyimpan data...", type: "loading" });
    try {
      const response = await fetch("/api/inputs/rkap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan data");
      setStatus({ message: result.message, type: "success" });
    } catch (err) {
      if (err instanceof Error)
        setStatus({ message: err.message, type: "error" });
      else setStatus({ message: "Terjadi kesalahan", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Input Target RKAP Tahunan</h1>
      <p className="text-gray-600 mb-6">
        Masukkan target tahunan untuk metrik produktivitas dan biaya.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        {/* --- Filter Section --- */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
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
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          {user?.role === "ADMIN_HOLDING" || user?.role === "SUPER_ADMIN" ? (
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
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Perusahaan
              </label>
              <input
                type="text"
                readOnly
                value={
                  companies.find((c) => c.id.toString() === formData.companyId)
                    ?.name || ""
                }
                className="mt-1 block w-full p-2 border-gray-200 rounded-md bg-gray-100 shadow-sm"
              />
            </div>
          )}
        </fieldset>

        {/* --- Target RKAP Section --- */}
        <fieldset className="space-y-4">
          <div>
            <label
              htmlFor="revenue"
              className="block text-sm font-medium text-gray-700"
            >
              Target Revenue (dalam Juta)
            </label>
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleInputChange}
              step="any"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="netProfit"
              className="block text-sm font-medium text-gray-700"
            >
              Target Net Profit (dalam Juta)
            </label>
            <input
              type="number"
              name="netProfit"
              value={formData.netProfit}
              onChange={handleInputChange}
              step="any"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="totalEmployeeCost"
              className="block text-sm font-medium text-gray-700"
            >
              Target Total Employee Cost (dalam Juta)
            </label>
            <input
              type="number"
              name="totalEmployeeCost"
              value={formData.totalEmployeeCost}
              onChange={handleInputChange}
              step="any"
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Target RKAP"}
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
}
