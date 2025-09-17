// File: app/(dashboard)/slideshow/page.tsx
"use client";

import { useAutoScrollPage } from "@/hooks/useAutoScrollPage";
import { useState } from "react";
import { Play, Pause } from "lucide-react";

// Import halaman lain sebagai komponen
import DashboardPage from "../page";
import OrganizationCulturePage from "../organization-culture/page";
import WorkforcePlanningPage from "../workforce-planning/page";

export default function SlideshowPage() {
  // State untuk kontrol On/Off, spesifik untuk halaman ini
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Aktifkan auto-scroll di halaman ini
  useAutoScrollPage({
    speed: 0.5,
    pauseBottom: 3000,
    enabled: isAutoScrolling,
  });

  return (
    <>
      {/* Kita susun setiap "halaman" di dalam tag <section> */}
      <section id="productivity-section">
        <DashboardPage />
      </section>

      {/* Beri pemisah antar section */}
      <div className="my-8 border-t-2 border-dashed border-gray-300"></div>

      <section id="org-culture-section">
        <OrganizationCulturePage />
      </section>

      {/* Beri pemisah antar section */}
      <div className="my-8 border-t-2 border-dashed border-gray-300"></div>

      <section id="workforce-planning-section">
        <WorkforcePlanningPage />
      </section>

      {/* Tombol kontrol On/Off untuk scroll */}
      <button
        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110"
        title={isAutoScrolling ? "Pause Scroll" : "Resume Scroll"}
      >
        {isAutoScrolling ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </>
  );
}
