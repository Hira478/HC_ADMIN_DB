"use client";

import { useAutoScrollPage } from "@/hooks/useAutoScrollPage";
import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";
import {
  Play,
  Pause,
  ScreenShare,
  CalendarDays,
  XCircle,
  Repeat,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Import halaman lain sebagai komponen
import DashboardPage from "../page";
import OrganizationCulturePage from "../organization-culture/page";
import WorkforcePlanningPage from "../workforce-planning/page";

type SlideshowMode = null | "company" | "period" | "loop";

export default function SlideshowPage() {
  const {
    companies,
    availablePeriods,
    selectedCompany,
    setSelectedCompany,
    period,
    setPeriod,
  } = useFilters();

  // Mulai scroll dalam keadaan 'false' untuk memberi jeda
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const [slideshowMode, setSlideshowMode] = useState<SlideshowMode>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect untuk memberi jeda 2 detik sebelum scroll dimulai
  // --- PERBAIKAN 2: useEffect untuk Jeda Saat Filter Berubah & Awal ---
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "instant" });
    }

    // Matikan scroll dulu
    setIsAutoScrolling(false);

    // Set timer untuk menyalakan scroll setelah jeda
    const startTimer = setTimeout(() => {
      // Hanya mulai jika mode sudah dipilih
      if (slideshowMode) {
        setIsAutoScrolling(true);
      }
    }, 5000); // Jeda 5 detik

    // Cleanup timer
    return () => clearTimeout(startTimer);
  }, [selectedCompany, period, slideshowMode]);

  // useEffect untuk me-reset scroll ke atas setiap kali filter berubah
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedCompany, period]);

  // Fungsi yang dijalankan saat scroll sampai di bawah
  const handleScrollEnd = () => {
    if (slideshowMode === "company" && companies.length > 0) {
      const nextIndex = (currentIndex + 1) % companies.length;
      setCurrentIndex(nextIndex);
      setSelectedCompany(companies[nextIndex].id);
    } else if (slideshowMode === "period" && availablePeriods.length > 0) {
      const nextIndex = (currentIndex + 1) % availablePeriods.length;
      setCurrentIndex(nextIndex);
      const nextPeriod = availablePeriods[nextIndex];
      setPeriod({ ...period, year: nextPeriod.year, value: nextPeriod.month });
    }
  };

  // Panggil hook auto-scroll
  useAutoScrollPage({
    speed: 0.5,
    pauseAtEdge: 4000,
    enabled: isAutoScrolling,
    onEnd: handleScrollEnd,
    loopMode:
      slideshowMode === "company" || slideshowMode === "period"
        ? "continuous"
        : "loop",
  });

  // useEffect untuk me-reset index saat mode diubah
  useEffect(() => {
    if (slideshowMode === "company") {
      const initialIndex = companies.findIndex((c) => c.id === selectedCompany);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    } else if (slideshowMode === "period") {
      const initialIndex = availablePeriods.findIndex(
        (p) => p.year === period.year && p.month === period.value
      );
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [slideshowMode, companies, availablePeriods, selectedCompany, period]);

  // Tampilan pilihan mode jika mode belum dipilih
  if (!slideshowMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Choose Slideshow Modes
        </h1>
        <p className="text-gray-500">
          Choose how data will be displayed automatically.
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setSlideshowMode("loop")}
            className="flex items-center gap-2 py-3 px-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Repeat className="text-purple-600" />
            <span className="font-semibold">Normal Loop</span>
          </button>
          <button
            onClick={() => setSlideshowMode("company")}
            className="flex items-center gap-2 py-3 px-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <ScreenShare className="text-blue-600" />
            <span className="font-semibold">Base of Companies</span>
          </button>
          <button
            onClick={() => setSlideshowMode("period")}
            className="flex items-center gap-2 py-3 px-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <CalendarDays className="text-green-600" />
            <span className="font-semibold">Base of Periods</span>
          </button>
        </div>

        <div className="mt-8 border-t pt-6 w-full max-w-lg text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan slideshow utama
  return (
    <>
      <div className="px-8 py-6">
        <section id="productivity-section">
          <DashboardPage />
        </section>
        <div className="my-8 border-t-2 border-dashed border-gray-300"></div>
        <section id="org-culture-section">
          <OrganizationCulturePage />
        </section>
        <div className="my-8 border-t-2 border-dashed border-gray-300"></div>
        <section id="workforce-planning-section">
          <WorkforcePlanningPage />
        </section>
      </div>

      {/* Tombol Kontrol Melayang */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setSlideshowMode(null)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110"
          title="Keluar Slideshow"
        >
          <XCircle size={24} />
        </button>
        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110"
          title={isAutoScrolling ? "Pause Scroll" : "Resume Scroll"}
        >
          {isAutoScrolling ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </>
  );
}
