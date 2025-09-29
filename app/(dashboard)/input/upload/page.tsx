// File: app/(dashboard)/input/upload/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { UploadCloud, Download } from "lucide-react";

// 1. Definisikan konfigurasi untuk setiap jenis upload
const uploadConfig = {
  rkap: {
    apiUrl: "/api/uploads/rkap",
    templateUrl: "/templates/template_rkap.xlsx", // Path ke template di folder /public
    title: "Target RKAP",
  },
  productivity: {
    apiUrl: "/api/uploads/productivity",
    templateUrl: "/templates/template_productivity.xlsx",
    title: "Data Produktivitas",
  },
  headcount: {
    apiUrl: "/api/uploads/headcount",
    templateUrl: "/templates/template_headcount.xlsx",
    title: "Data Headcount",
  },
  education: {
    apiUrl: "/api/uploads/education",
    templateUrl: "/templates/template_education.xlsx",
    title: "Data Edukasi",
  },
  age: {
    apiUrl: "/api/uploads/age",
    templateUrl: "/templates/template_age.xlsx",
    title: "Data Rentang Usia",
  },
  level: {
    apiUrl: "/api/uploads/level",
    templateUrl: "/templates/template_level.xlsx",
    title: "Data Level Jabatan",
  },
  employeeEngagement: {
    apiUrl: "/api/uploads/employee-engagement",
    templateUrl: "/templates/template_engagement.xlsx",
    title: "Data Employee Engagement",
  },
  cultureMaturity: {
    apiUrl: "/api/uploads/culture-maturity",
    templateUrl: "/templates/template_culture.xlsx",
    title: "Data Culture Maturity",
  },
  hcmaScore: {
    apiUrl: "/api/uploads/hcma-score",
    templateUrl: "/templates/template_hcma.xlsx",
    title: "Data HCMA Score",
  },
  divisionStat: {
    apiUrl: "/api/uploads/division-stat",
    templateUrl: "/templates/template_division.xlsx",
    title: "Data Per Divisi",
  },
  manpowerPlanning: {
    apiUrl: "/api/uploads/manpower-planning",
    templateUrl: "/templates/template_mpp.xlsx",
    title: "Data Manpower Planning",
  },
  formationRatio: {
    apiUrl: "/api/uploads/formation-ratio",
    templateUrl: "/templates/template_formation_ratio.xlsx",
    title: "Data Rasio Formasi",
  },
  turnover: {
    apiUrl: "/api/uploads/turnover",
    templateUrl: "/templates/template_turnover.xlsx",
    title: "Data Turnover",
  },
  quartalKpi: {
    apiUrl: "/api/uploads/quartal-kpi",
    templateUrl: "/templates/template_quartal_kpi.xlsx",
    title: "Data KPI Kuartalan",
  },
  // Anda bisa tambahkan jenis data lain di sini nanti, misal: 'headcount', 'demography', dll.
};

type UploadType = keyof typeof uploadConfig;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);

  // 2. State baru untuk melacak jenis data yang dipilih
  const [uploadType, setUploadType] = useState<UploadType>("rkap");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus({ message: "", type: "" }); // Reset status saat file baru dipilih
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({
        message: "Silakan pilih file terlebih dahulu.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    setStatus({ message: "Mengunggah dan memproses file...", type: "loading" });

    const formData = new FormData();
    formData.append("file", file);

    // 3. Gunakan apiUrl dinamis dari config
    const config = uploadConfig[uploadType];

    try {
      const response = await fetch(config.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");

      setStatus({ message: result.message, type: "success" });
      setFile(null);
    } catch (err: unknown) {
      if (err instanceof Error)
        setStatus({ message: err.message, type: "error" });
      else
        setStatus({
          message: "Terjadi kesalahan tidak diketahui.",
          type: "error",
        });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedConfig = uploadConfig[uploadType];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Bulk Upload Data Excel</h1>
      <p className="text-gray-600 mb-6">
        Unggah file Excel berisi data historis atau bulanan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        {/* --- 4. DROPDOWN PILIHAN DATA --- */}
        <div>
          <label
            htmlFor="uploadType"
            className="block text-sm font-medium text-gray-700"
          >
            Pilih Jenis Data
          </label>
          <select
            id="uploadType"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as UploadType)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            {Object.entries(uploadConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.title}
              </option>
            ))}
          </select>
        </div>

        {/* --- 5. Tombol Download Template Dinamis --- */}
        <a
          href={selectedConfig.templateUrl}
          download
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <Download size={16} />
          Download Template untuk {selectedConfig.title}
        </a>

        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Pilih File (format: {selectedConfig.title})
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer ..."
                >
                  <span>Unggah sebuah file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".xlsx, .xls, .csv"
                  />
                </label>
                <p className="pl-1">atau seret dan lepas</p>
              </div>
              {file ? (
                <p className="text-sm text-gray-500 font-semibold">
                  {file.name}
                </p>
              ) : (
                <p className="text-xs text-gray-500">Maksimal 10MB</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full ..."
        >
          {isUploading
            ? "Memproses..."
            : `Mulai Import ${selectedConfig.title}`}
        </button>

        {status.message && (
          <div
            className={`p-3 rounded-md text-center text-sm ${
              status.type === "success"
                ? "..."
                : status.type === "error"
                ? "..."
                : "..."
            }`}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
