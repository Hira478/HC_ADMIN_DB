"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";

// --- 1. Definisikan interface untuk bentuk form data ---
interface ProductivityFormData {
  year: number;
  month: number;
  companyId: number | string; // Bisa string (saat kosong) atau number (saat dipilih)
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
  totalCost: number;
  kpiFinansial: number;
  kpiOperasional: number;
  kpiSosial: number;
  kpiInovasiBisnis: number;
  kpiKepemimpinanTeknologi: number;
  kpiPeningkatanInvestasi: number;
  kpiPengembanganTalenta: number;
  totalScore: number; // Tambahkan total score
}

// Gunakan interface untuk initial state
const initialFormData: ProductivityFormData = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  companyId: "", // Awalnya string kosong, ini tidak apa-apa
  revenue: 0,
  netProfit: 0,
  totalEmployeeCost: 0,
  totalCost: 0,
  // Tambahkan 7 KPI baru
  kpiFinansial: 0,
  kpiOperasional: 0,
  kpiSosial: 0,
  kpiInovasiBisnis: 0,
  kpiKepemimpinanTeknologi: 0,
  kpiPeningkatanInvestasi: 0,
  kpiPengembanganTalenta: 0,
  totalScore: 0,
};

const InputProductivityPage = () => {
  const { user, companies, loading: companiesLoading } = useFilters();
  const [formData, setFormData] =
    useState<ProductivityFormData>(initialFormData);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kunci companyId jika user adalah Anper
    if (user?.role === "USER_ANPER") {
      setFormData((prev) => ({ ...prev, companyId: user.companyId }));
    }
    // Set default company jika user adalah admin dan daftar perusahaan sudah ada
    else if (companies.length > 0 && !formData.companyId) {
      setFormData((prev) => ({ ...prev, companyId: companies[0].id }));
    }
  }, [user, companies, formData.companyId]);

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
      const response = await fetch("/api/input/productivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");
      setStatus({
        message: "Data produktivitas berhasil disimpan!",
        type: "success",
      });
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
      <h1 className="text-3xl font-bold mb-6">
        Input: Productivity & Employee Cost
      </h1>
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
            {user?.role === "ADMIN_HOLDING" || user?.role === "SUPER_ADMIN" ? (
              <select
                name="companyId"
                id="companyId"
                value={formData.companyId}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
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
            ) : (
              <input
                type="text"
                readOnly
                value={
                  companies.find((c) => c.id === formData.companyId)?.name ||
                  "Loading..."
                }
                className="mt-1 block w-full p-2 border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed"
              />
            )}
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
        <fieldset className="border-t pt-6">
          <legend className="text-lg font-semibold text-gray-900">
            Skor KPI (Bulanan)
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {/* Ganti field lama dengan 7 field baru */}
            <div>
              <label htmlFor="kpiFinansial">Finansial</label>
              <input
                type="number"
                name="kpiFinansial"
                value={formData.kpiFinansial}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiOperasional">Operasional</label>
              <input
                type="number"
                name="kpiOperasional"
                value={formData.kpiOperasional}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiSosial">Sosial</label>
              <input
                type="number"
                name="kpiSosial"
                value={formData.kpiSosial}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiInovasiBisnis">Inovasi Bisnis</label>
              <input
                type="number"
                name="kpiInovasiBisnis"
                value={formData.kpiInovasiBisnis}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiKepemimpinanTeknologi">
                Kepemimpinan Teknologi
              </label>
              <input
                type="number"
                name="kpiKepemimpinanTeknologi"
                value={formData.kpiKepemimpinanTeknologi}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiPeningkatanInvestasi">
                Peningkatan Investasi
              </label>
              <input
                type="number"
                name="kpiPeningkatanInvestasi"
                value={formData.kpiPeningkatanInvestasi}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="kpiPengembanganTalenta">
                Pengembangan Talenta
              </label>
              <input
                type="number"
                name="kpiPengembanganTalenta"
                value={formData.kpiPengembanganTalenta}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="totalScore">Total Score</label>
              <input
                type="number"
                name="totalScore"
                value={formData.totalScore}
                onChange={handleChange}
                step="any"
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>
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
            <input
              type="number"
              name="revenue"
              id="revenue"
              value={formData.revenue}
              onChange={handleChange}
              required
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan jumlah revenue"
            />
          </div>
          <div>
            <label
              htmlFor="netProfit"
              className="block text-sm font-medium text-gray-700"
            >
              Net Profit
            </label>
            <input
              type="number"
              name="netProfit"
              id="netProfit"
              value={formData.netProfit}
              onChange={handleChange}
              required
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Bisa negatif, misal: -50000"
            />
          </div>
          <div>
            <label
              htmlFor="totalEmployeeCost"
              className="block text-sm font-medium text-gray-700"
            >
              Total Employee Cost
            </label>
            <input
              type="number"
              name="totalEmployeeCost"
              id="totalEmployeeCost"
              value={formData.totalEmployeeCost}
              onChange={handleChange}
              required
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan total biaya karyawan"
            />
          </div>
          <div>
            <label
              htmlFor="totalCost"
              className="block text-sm font-medium text-gray-700"
            >
              Total Cost
            </label>
            <input
              type="number"
              name="totalCost"
              id="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              required
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan total biaya operasional"
            />
          </div>
        </div>

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

export default InputProductivityPage;
