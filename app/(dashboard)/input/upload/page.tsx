// File: app/(dashboard)/input/upload/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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

    try {
      const response = await fetch("/api/uploads/rkap", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");

      setStatus({ message: result.message, type: "success" });
      setFile(null); // Reset input file setelah berhasil
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Bulk Upload: Target RKAP</h1>
      <p className="text-gray-600 mb-6">
        Unggah file Excel berisi data target RKAP tahunan untuk semua
        perusahaan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Pilih File Excel (.xlsx, .xls, .csv)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isUploading ? "Memproses..." : "Mulai Import"}
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
