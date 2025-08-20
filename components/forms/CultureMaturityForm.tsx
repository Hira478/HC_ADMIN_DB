// components/forms/CultureMaturityForm.tsx
"use client";
import { Company } from "@/types";
import React, { useState } from "react";

const INDICATORS = [
  { id: "amanah", label: "Amanah" },
  { id: "kompeten", label: "Kompeten" },
  { id: "harmonis", label: "Harmonis" },
  { id: "loyal", label: "Loyal" },
  { id: "adaptif", label: "Adaptif" },
  { id: "kolaboratif", label: "Kolaboratif" },
  { id: "totalScore", label: "Skor Total Culture" },
];

interface FormProps {
  companies: Company[];
}

const CultureMaturityForm: React.FC<FormProps> = ({ companies }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    companyId: "",
    year: new Date().getFullYear().toString(),
    ...Object.fromEntries(INDICATORS.map((i) => [i.id, ""])),
  });

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
      const res = await fetch("/api/input/culture-maturity", {
        // URL API yang berbeda
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Terjadi kesalahan");
      setMessage(`Sukses! ${result.message}`);
    } catch (error: unknown) {
      // Ganti 'any' menjadi 'unknown'
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bagian Perusahaan */}
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
        {/* Bagian Tahun */}
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
              step="0.01"
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
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? "Menyimpan..." : "Simpan Data Culture Maturity"}
        </button>
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

export default CultureMaturityForm;
