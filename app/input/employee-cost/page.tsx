"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";

// Definisikan tipe data untuk state form
interface FormData {
  year: number;
  month: number;
  companyId: number | string;
  salary: number;
  incentive: number;
  pension: number;
  others: number;
  trainingRecruitment: number;
}

// Nilai awal untuk form
const initialFormData: FormData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  companyId: "",
  salary: 0,
  incentive: 0,
  pension: 0,
  others: 0,
  trainingRecruitment: 0,
};

const InputEmployeeCostPage = () => {
  const { companies, loading: companiesLoading } = useFilters();
  const [formData, setFormData] = useState<FormData>(initialFormData);
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
    const isNumber = e.target.type === "number" || name === "companyId";
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
      const response = await fetch("/api/input/employee-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");
      setStatus({ message: "Data berhasil disimpan!", type: "success" });
    } catch (error) {
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
      <h1 className="text-3xl font-bold mb-6">Input: Rincian Biaya Karyawan</h1>
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
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

        <fieldset>
          <legend className="text-lg font-semibold text-gray-900">
            Komponen Biaya
          </legend>
          <div className="space-y-4 mt-2">
            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-700"
              >
                Salary
              </label>
              <input
                type="number"
                name="salary"
                id="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="incentive"
                className="block text-sm font-medium text-gray-700"
              >
                Incentive
              </label>
              <input
                type="number"
                name="incentive"
                id="incentive"
                value={formData.incentive}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="pension"
                className="block text-sm font-medium text-gray-700"
              >
                Pension
              </label>
              <input
                type="number"
                name="pension"
                id="pension"
                value={formData.pension}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="others"
                className="block text-sm font-medium text-gray-700"
              >
                Others
              </label>
              <input
                type="number"
                name="others"
                id="others"
                value={formData.others}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="trainingRecruitment"
                className="block text-sm font-medium text-gray-700"
              >
                Training & Recruitment
              </label>
              <input
                type="number"
                name="trainingRecruitment"
                id="trainingRecruitment"
                value={formData.trainingRecruitment}
                onChange={handleChange}
                required
                step="any"
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
          {isSubmitting ? "Menyimpan..." : "Simpan Data Biaya"}
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
export default InputEmployeeCostPage;
