// components/layout/Sidebar.tsx
import {
  Home,
  LineChart,
  Users,
  Mails,
  Settings,
  Building,
} from "lucide-react";
import React from "react";

const Sidebar = () => {
  return (
    // Kontainer utama sidebar
    <aside className="hidden md:flex h-screen w-20 flex-col items-center border-r border-gray-200 bg-white">
      {/* Logo Placeholder */}
      <div className="flex h-20 w-full items-center justify-center border-b border-gray-200">
        <Building className="h-8 w-8 text-blue-600" />
      </div>

      {/* Daftar Ikon Navigasi */}
      <nav className="flex flex-1 flex-col items-center space-y-2 py-4">
        {/* Ikon Aktif */}
        <button className="relative rounded-lg bg-blue-100 p-3 text-blue-600 hover:bg-blue-100">
          <Home className="h-6 w-6" />
          {/* Indikator aktif */}
          <div className="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 transform rounded-full bg-blue-600"></div>
        </button>

        {/* Ikon Lainnya */}
        <button className="rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <LineChart className="h-6 w-6" />
        </button>
        <button className="rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Users className="h-6 w-6" />
        </button>
        <button className="rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Mails className="h-6 w-6" />
        </button>
      </nav>

      {/* Ikon Pengaturan di bagian bawah */}
      <div className="py-4">
        <button className="rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
