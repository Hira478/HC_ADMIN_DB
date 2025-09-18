// components/layout/Sidebar.tsx
"use client";

import {
  Settings,
  Building,
  LogOut,
  Users,
  LayoutDashboard,
  Network, // <-- Ganti Sitemap ke Network untuk menghindari error
  ClipboardList,
  DollarSign, // <-- 1. Import Ikon Baru
  Wallet, // <-- 1. Import Ikon Baru
  Database, // <-- 1. Import Ikon Baru
  PencilLine, // <-- Import PencilLine Icon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useFilters } from "@/contexts/FilterContext";
import { User as UserIcon } from "lucide-react"; // <-- Import ikon User
import Image from "next/image";

interface SidebarItemProps {
  icon: React.ReactNode;
  href: string;
  title: string; // <-- Diubah di sini
}

const SidebarItem = ({ icon, href, title }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="w-full">
      <button
        className={`w-full flex items-start gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors text-left ${
          isActive
            ? "bg-red-100 text-red-700 font-semibold"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        {icon}
        <span className="text-left">
          {title.split("\n").map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </span>
      </button>
    </Link>
  );
};

const Sidebar = () => {
  const { user, logout } = useFilters();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="hidden md:flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 w-full items-start justify-start gap-3 border-b border-gray-200 px-6">
        <div>
          <p className="text-lg font-bold text-gray-800">IFG HC Dashboard</p>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <SidebarItem
          href="/"
          icon={<LayoutDashboard size={20} />}
          title="Productivity"
        />

        {/* --- PERBAIKAN DI SINI: GUNAKAN '\n' --- */}
        <SidebarItem
          href="/organization-culture"
          icon={<Network size={20} />}
          title={"Organization\n& Culture"}
        />
        <SidebarItem
          href="/workforce-planning"
          icon={<ClipboardList size={20} />}
          title={"Workforce\nPlanning"}
        />

        {user?.role === "SUPER_ADMIN" && (
          <>
            <div className="pt-4 pb-2 px-4">
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Admin
              </span>
            </div>
            <SidebarItem
              href="/admin/users"
              icon={<Users size={20} />}
              title={"User\nManagement"}
            />
          </>
        )}
      </nav>
      {/*
      <a
        href="/input"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      >
        <PencilLine size={20} />
        <span>Input Data</span>
      </a>
      */}

      {/* --- PERUBAHAN DI SINI: BAGIAN USER & LOGOUT --- */}
      <div className="px-4 py-4 border-t border-gray-200">
        {/* --- BLOK INFO USER BARU --- */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-start justify-center rounded-full bg-gray-100">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user ? user.name : "..."}
            </p>
            <p
              className="text-xs text-gray-500 truncate"
              title={user?.companyName}
            >
              {user ? user.companyName : "..."}
            </p>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
