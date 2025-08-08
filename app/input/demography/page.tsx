"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";

// Define a clear interface for the form's data shape
interface DemographyFormData {
  year: number;
  month: number;
  companyId: number | string; // Can be string when empty, number when selected
  maleCount: number;
  femaleCount: number;
  permanentCount: number;
  contractCount: number;
  smaSmkCount: number;
  d3Count: number;
  s1Count: number;
  s2Count: number;
  s3Count: number;
  bod1Count: number;
  bod2Count: number;
  bod3Count: number;
  bod4Count: number;
  under25Count: number;
  age26to40Count: number;
  age41to50Count: number;
  over50Count: number;
  los_0_5_Count: number;
  los_6_10_Count: number;
  los_11_15_Count: number;
  los_16_20_Count: number;
  los_21_25_Count: number;
  los_25_30_Count: number;
  los_over_30_Count: number;
}

// Use the interface for the initial form data
const initialFormData: DemographyFormData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  companyId: "",
  maleCount: 0,
  femaleCount: 0,
  permanentCount: 0,
  contractCount: 0,
  smaSmkCount: 0,
  d3Count: 0,
  s1Count: 0,
  s2Count: 0,
  s3Count: 0,
  bod1Count: 0,
  bod2Count: 0,
  bod3Count: 0,
  bod4Count: 0,
  under25Count: 0,
  age26to40Count: 0,
  age41to50Count: 0,
  over50Count: 0,
  los_0_5_Count: 0,
  los_6_10_Count: 0,
  los_11_15_Count: 0,
  los_16_20_Count: 0,
  los_21_25_Count: 0,
  los_25_30_Count: 0,
  los_over_30_Count: 0,
};

const InputDemographyPage = () => {
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
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Menyimpan data...", type: "loading" });

    try {
      const response = await fetch("/api/input/demography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");
      setStatus({
        message: "Data demografi berhasil disimpan!",
        type: "success",
      });
    } catch (error) {
      // <-- CORRECTED: Removed ': any'
      // Add a type guard for safe error handling
      if (error instanceof Error) {
        setStatus({ message: `Error: ${error.message}`, type: "error" });
      } else {
        setStatus({ message: "An unknown error occurred.", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Input: Data Demografi</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-8"
      >
        {/* Periode & Perusahaan */}
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
                <option>Memuat...</option>
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

        {/* Headcount */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Headcount
          </legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="maleCount" className="text-sm font-medium">
                Pria
              </label>
              <input
                type="number"
                name="maleCount"
                value={formData.maleCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="femaleCount" className="text-sm font-medium">
                Wanita
              </label>
              <input
                type="number"
                name="femaleCount"
                value={formData.femaleCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* Status Karyawan */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Status Karyawan
          </legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="permanentCount" className="text-sm font-medium">
                Permanen
              </label>
              <input
                type="number"
                name="permanentCount"
                value={formData.permanentCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="contractCount" className="text-sm font-medium">
                Kontrak
              </label>
              <input
                type="number"
                name="contractCount"
                value={formData.contractCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* Edukasi */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Edukasi
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
            <div>
              <label htmlFor="smaSmkCount" className="text-sm font-medium">
                {"< D3"}
              </label>
              <input
                type="number"
                name="smaSmkCount"
                value={formData.smaSmkCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="d3Count" className="text-sm font-medium">
                D3
              </label>
              <input
                type="number"
                name="d3Count"
                value={formData.d3Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="s1Count" className="text-sm font-medium">
                S1
              </label>
              <input
                type="number"
                name="s1Count"
                value={formData.s1Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="s2Count" className="text-sm font-medium">
                S2
              </label>
              <input
                type="number"
                name="s2Count"
                value={formData.s2Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="s3Count" className="text-sm font-medium">
                S3
              </label>
              <input
                type="number"
                name="s3Count"
                value={formData.s3Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* Level */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Level Jabatan
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label htmlFor="bod1Count" className="text-sm font-medium">
                BOD-1
              </label>
              <input
                type="number"
                name="bod1Count"
                value={formData.bod1Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="bod2Count" className="text-sm font-medium">
                BOD-2
              </label>
              <input
                type="number"
                name="bod2Count"
                value={formData.bod2Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="bod3Count" className="text-sm font-medium">
                BOD-3
              </label>
              <input
                type="number"
                name="bod3Count"
                value={formData.bod3Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="bod4Count" className="text-sm font-medium">
                BOD-4
              </label>
              <input
                type="number"
                name="bod4Count"
                value={formData.bod4Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* Usia */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Rentang Usia
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label htmlFor="under25Count" className="text-sm font-medium">
                {"< 25"}
              </label>
              <input
                type="number"
                name="under25Count"
                value={formData.under25Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="age26to40Count" className="text-sm font-medium">
                26-40
              </label>
              <input
                type="number"
                name="age26to40Count"
                value={formData.age26to40Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="age41to50Count" className="text-sm font-medium">
                41-50
              </label>
              <input
                type="number"
                name="age41to50Count"
                value={formData.age41to50Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="over50Count" className="text-sm font-medium">
                {"> 50"}
              </label>
              <input
                type="number"
                name="over50Count"
                value={formData.over50Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        {/* Lama Bekerja */}
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Lama Bekerja (Tahun)
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label htmlFor="los_0_5_Count" className="text-sm font-medium">
                0-5
              </label>
              <input
                type="number"
                name="los_0_5_Count"
                value={formData.los_0_5_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="los_6_10_Count" className="text-sm font-medium">
                6-10
              </label>
              <input
                type="number"
                name="los_6_10_Count"
                value={formData.los_6_10_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="los_11_15_Count" className="text-sm font-medium">
                11-15
              </label>
              <input
                type="number"
                name="los_11_15_Count"
                value={formData.los_11_15_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="los_16_20_Count" className="text-sm font-medium">
                16-20
              </label>
              <input
                type="number"
                name="los_16_20_Count"
                value={formData.los_16_20_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="los_21_25_Count" className="text-sm font-medium">
                21-25
              </label>
              <input
                type="number"
                name="los_21_25_Count"
                value={formData.los_21_25_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="los_25_30_Count" className="text-sm font-medium">
                25-30
              </label>
              <input
                type="number"
                name="los_25_30_Count"
                value={formData.los_25_30_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="los_over_30_Count"
                className="text-sm font-medium"
              >
                {"> 30"}
              </label>
              <input
                type="number"
                name="los_over_30_Count"
                value={formData.los_over_30_Count}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Data Demografi"}
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

export default InputDemographyPage;
