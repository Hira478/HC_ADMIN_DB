"use client";

import { useEffect, useRef } from "react";

interface AutoScrollOptions {
  enabled?: boolean;
  speed?: number;
  pauseAtEdge?: number;
  resumeDelay?: number;
  onEnd?: () => void;
  loopMode?: "continuous" | "loop";
}

export function useAutoScrollPage({
  enabled = true,
  speed = 0.5,
  pauseAtEdge = 2000,
  resumeDelay = 5000,
  onEnd,
  loopMode = "continuous",
}: AutoScrollOptions = {}) {
  const running = useRef(true);
  const rafId = useRef<number | null>(null);
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    scrollContainerRef.current = document.getElementById("main-content");
  }, []);

  useEffect(() => {
    if (enabled) {
      running.current = true;
    } else {
      running.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    const step = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer || !enabled || !running.current || document.hidden) {
        rafId.current = requestAnimationFrame(step);
        return;
      }

      // Selalu scroll ke bawah
      scrollContainer.scrollBy(0, speed);

      const atBottom =
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 1;

      if (atBottom) {
        running.current = false; // Berhenti sementara

        // Jeda sejenak di bawah
        setTimeout(() => {
          if (loopMode === "continuous") {
            // Untuk mode ganti filter, panggil onEnd dan berhenti
            onEnd?.();
          } else if (loopMode === "loop") {
            // --- PERBAIKAN LOGIKA LOOP DI SINI ---
            // Langsung lompat ke atas tanpa animasi
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
            // Setelah jeda singkat, lanjutkan scroll
            setTimeout(() => {
              running.current = true;
              rafId.current = requestAnimationFrame(step);
            }, 5000); // Jeda 0.5 detik di atas sebelum mulai lagi
          }
        }, pauseAtEdge);

        // Hentikan loop saat ini, akan dilanjutkan oleh setTimeout
        return;
      }

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);

    const onInteract = () => {
      running.current = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };

    const onRelease = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(
        () => (running.current = true),
        resumeDelay
      );
    };

    const interactionEvents: (keyof HTMLElementEventMap)[] = [
      "wheel",
      "touchstart",
      "keydown",
      "pointerdown",
    ];
    const container = scrollContainerRef.current;

    if (container) {
      interactionEvents.forEach((e) =>
        container.addEventListener(e, onInteract, { passive: true })
      );
      container.addEventListener("pointerup", onRelease);
      container.addEventListener("keyup", onRelease);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    // Fungsi cleanup
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (container) {
        interactionEvents.forEach((e) =>
          container.removeEventListener(e, onInteract)
        );
        container.removeEventListener("pointerup", onRelease);
        container.removeEventListener("keyup", onRelease);
      }
    };
  }, [speed, pauseAtEdge, resumeDelay, enabled, onEnd, loopMode]);
}
