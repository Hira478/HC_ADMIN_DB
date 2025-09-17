// File: app/(dashboard)/admin/users/page.tsx
"use client";

import { useFilters } from "@/contexts/FilterContext";
import { useEffect, useState } from "react";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

// Tipe untuk data user yang diterima dari API (tanpa password)
type UserData = {
  id: number;
  name: string;
  email: string;
  role: "USER_ANPER" | "ADMIN_HOLDING" | "SUPER_ADMIN";
  companyId: number;
  company: {
    name: string;
  };
};

// Tipe untuk data form, password sekarang opsional
type UserFormData = {
  name: string;
  email: string;
  password?: string; // Password tidak wajib saat mengedit
  companyId: string;
  role: "USER_ANPER" | "ADMIN_HOLDING" | "SUPER_ADMIN";
};

// State awal yang bersih untuk form
const EMPTY_FORM_STATE: UserFormData = {
  name: "",
  email: "",
  password: "",
  companyId: "",
  role: "USER_ANPER",
};

export default function UserManagementPage() {
  const { user: loggedInUser, companies } = useFilters();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State yang Dirapikan ---
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUserForm, setCurrentUserForm] =
    useState<UserFormData>(EMPTY_FORM_STATE);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Fungsi terpusat untuk mengambil data user
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Gagal memuat data pengguna.");
      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect untuk fetch data awal
  useEffect(() => {
    if (loggedInUser?.role === "SUPER_ADMIN") {
      fetchUsers();
    } else {
      setIsLoading(false); // Hentikan loading jika bukan admin
    }
  }, [loggedInUser]);

  // Handler untuk membuka & menutup modal
  const handleOpenAddModal = () => {
    setCurrentUserForm({
      ...EMPTY_FORM_STATE,
      companyId: companies[0]?.id.toString() || "",
    });
    setModalMode("ADD");
  };

  const handleOpenEditModal = (userToEdit: UserData) => {
    setEditingUserId(userToEdit.id);
    setCurrentUserForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: "", // Selalu kosongkan password saat edit, hanya diisi jika ingin diubah
      companyId: userToEdit.companyId.toString(),
      role: userToEdit.role,
    });
    setModalMode("EDIT");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setFormError(null);
    setEditingUserId(null);
  };

  // Handler untuk input form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCurrentUserForm({ ...currentUserForm, [e.target.name]: e.target.value });
  };

  // Handler untuk submit (bisa untuk Add dan Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const isEditing = modalMode === "EDIT";
    const url = isEditing ? `/api/users/${editingUserId}` : "/api/users";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUserForm),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || `Gagal ${isEditing ? "memperbarui" : "membuat"} user.`
        );

      handleCloseModal();
      await fetchUsers(); // Refresh tabel
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk Delete
  const handleDelete = async (userId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal menghapus user.");
      }
      await fetchUsers(); // Refresh tabel
    } catch (err: unknown) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
      else alert("Terjadi kesalahan.");
    }
  };

  // Guard Clause untuk non-admin (tidak berubah)
  if (loggedInUser && loggedInUser.role !== "SUPER_ADMIN") {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-red-600">Akses Ditolak</h1>
        <p className="text-gray-600 mt-2">
          Anda tidak memiliki wewenang untuk mengakses halaman manajemen user.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-center">Loading users...</p>
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "SUPER_ADMIN"
                          ? "bg-red-100 text-red-800"
                          : user.role === "ADMIN_HOLDING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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
        title={modalMode === "ADD" ? "Add New User" : "Edit User"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              value={currentUserForm.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={currentUserForm.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={currentUserForm.password}
              onChange={handleInputChange}
              required={modalMode === "ADD"}
              placeholder={
                modalMode === "EDIT"
                  ? "(leave blank if not change password)"
                  : ""
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="companyId"
              className="block text-sm font-medium text-gray-700"
            >
              Company
            </label>
            <select
              name="companyId"
              value={currentUserForm.companyId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              name="role"
              value={currentUserForm.role}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
            >
              <option value="USER_ANPER">User Anper</option>
              <option value="ADMIN_HOLDING">Admin Holding</option>
              <option value="SUPER_ADMIN">Super Admin</option>
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
              {isSubmitting ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
