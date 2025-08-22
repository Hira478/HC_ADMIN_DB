"use client"; // <-- Tandai sebagai Client Component untuk menggunakan hook

import {
  Home,
  Settings,
  Building,
  Globe,
  Briefcase,
  ClipboardEdit,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // <-- Import hook untuk mendeteksi path
import React from "react";

// Definisikan tipe untuk properti item sidebar agar lebih rapi
interface SidebarItemProps {
  icon: React.ReactNode;
  href: string;
  title: string;
}

// Sub-komponen baru untuk setiap item sidebar agar tidak mengulang kode
const SidebarItem = ({ icon, href, title }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <button
        className={`relative rounded-lg p-3 ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`}
        title={title}
      >
        {icon}
        {isActive && (
          <div className="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 transform rounded-full bg-blue-600"></div>
        )}
      </button>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden md:flex h-screen w-20 flex-col items-center border-r border-gray-200 bg-white">
      {/* Logo Placeholder */}
      <div className="flex h-20 w-full items-center justify-center border-b border-gray-200">
        <Building className="h-8 w-8 text-blue-600" />
      </div>

      {/* Daftar Ikon Navigasi */}
      <nav className="flex flex-1 flex-col items-center space-y-2 py-4">
        <SidebarItem
          href="/"
          icon={<Home className="h-6 w-6" />}
          title="Dashboard"
        />
        {/* 2. Tambahkan item baru untuk Organization & Culture */}

        <SidebarItem
          href="/organization-culture"
          icon={<Globe className="h-6 w-6" />}
          title="Organization & Culture"
        />
        {/*
        <SidebarItem
          href="/workforce-planning"
          icon={<Briefcase className="h-6 w-6" />}
          title="Workforce Planning"
        />
        <SidebarItem
          href="/input/scores"
          icon={<ClipboardEdit className="h-6 w-6" />}
          title="Input Skor"
        />
        */}

        {/* 3. Nonaktifkan sementara tautan input dan upload */}
        {/* <SidebarItem
          href="/input/productivity"
          icon={<DollarSign className="h-6 w-6" />}
          title="Input Productivity Data"
        />
        <SidebarItem
          href="/input/employee-cost"
          icon={<Wallet className="h-6 w-6" />}
          title="Input Rincian Biaya Karyawan"
        />
        <SidebarItem
          href="/input/demography"
          icon={<Database className="h-6 w-6" />}
          title="Input Demography Data"
        />
        <SidebarItem
          href="/upload"
          icon={<Upload className="h-6 w-6" />}
          title="Upload Excel File"
        /> 
        */}
      </nav>

      {/* Ikon Pengaturan di bagian bawah */}
      <div className="py-4">
        <button
          className="rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Settings"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
