// File: app/(dashboard)/admin/companies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { Building, Edit, Trash2, PlusCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

// Tipe untuk data perusahaan
type CompanyData = {
  id: number;
  name: string;
  type: string;
};

// Tipe untuk data form
type CompanyFormData = {
  name: string;
  type: "Holding" | "Anper";
};

// State awal untuk form
const EMPTY_FORM_STATE: CompanyFormData = {
  name: "",
  type: "Anper",
};

export default function CompanyManagementPage() {
  const { user: loggedInUser } = useFilters();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk modal dan form
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentCompanyForm, setCurrentCompanyForm] =
    useState<CompanyFormData>(EMPTY_FORM_STATE);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

  // Fungsi untuk mengambil data perusahaan
  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/companies"); // Menggunakan API baru
      if (!response.ok) throw new Error("Gagal mengambil data perusahaan.");
      const data = await response.json();
      setCompanies(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat komponen dimuat
  useEffect(() => {
    if (loggedInUser?.role === "SUPER_ADMIN") {
      fetchCompanies();
    } else {
      setIsLoading(false);
    }
  }, [loggedInUser]);

  // Handler untuk membuka modal
  const handleOpenAddModal = () => {
    setCurrentCompanyForm(EMPTY_FORM_STATE);
    setModalMode("ADD");
  };

  const handleOpenEditModal = (companyToEdit: CompanyData) => {
    setEditingCompanyId(companyToEdit.id);
    setCurrentCompanyForm({
      name: companyToEdit.name,
      type: companyToEdit.type as "Holding" | "Anper",
    });
    setModalMode("EDIT");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setFormError(null);
    setEditingCompanyId(null);
  };

  // Handler untuk input form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCurrentCompanyForm({
      ...currentCompanyForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handler untuk submit form (Add & Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const isEditing = modalMode === "EDIT";
    const url = isEditing
      ? `/api/admin/companies/${editingCompanyId}`
      : "/api/admin/companies";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentCompanyForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan data.");

      handleCloseModal();
      await fetchCompanies(); // Refresh tabel
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk hapus
  const handleDelete = async (companyId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus perusahaan ini?"))
      return;

    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal menghapus perusahaan.");
      }
      await fetchCompanies(); // Refresh tabel
    } catch (err: unknown) {
      alert(
        `Error: ${err instanceof Error ? err.message : "Terjadi kesalahan."}`
      );
    }
  };

  // Guard Clause untuk non-admin
  if (loggedInUser && loggedInUser.role !== "SUPER_ADMIN") {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-red-600">Akses Ditolak</h1>
        <p className="text-gray-600 mt-2">
          Halaman ini hanya untuk Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Company Management</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Add New Company
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-center">Loading companies...</p>
        ) : error ? (
          <p className="p-6 text-center text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalMode !== null}
        onClose={handleCloseModal}
        title={modalMode === "ADD" ? "Add New Company" : "Edit Company"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              name="name"
              value={currentCompanyForm.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Company Type
            </label>
            <select
              name="type"
              value={currentCompanyForm.type}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
            >
              <option value="Anper">Anper</option>
              <option value="Holding">Holding</option>
            </select>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Company"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
