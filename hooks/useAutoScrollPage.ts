// File: hooks/useAutoScrollPage.ts
"use client";

import { useEffect, useRef } from "react";

interface AutoScrollOptions {
  enabled?: boolean;
  speed?: number;
  pauseBottom?: number;
  pauseTop?: number;
  resumeDelay?: number;
}

export function useAutoScrollPage({
  enabled = true,
  speed = 1,
  pauseBottom = 2000,
  pauseTop = 1000,
  resumeDelay = 5000,
}: AutoScrollOptions = {}) {
  const running = useRef(true);
  const rafId = useRef<number | null>(null);
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    scrollContainerRef.current = document.getElementById("main-content");
  }, []);

  // --- PERBAIKAN DI SINI: TAMBAHKAN useEffect BARU ---
  // Hook ini bertugas untuk me-reset state 'running' internal
  // setiap kali scroll diaktifkan dari luar.
  useEffect(() => {
    if (enabled) {
      running.current = true;
    }
  }, [enabled]); // Hook ini hanya berjalan saat prop 'enabled' berubah.

  useEffect(() => {
    const step = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        return;
      }

      if (!enabled || !running.current || document.hidden) {
        rafId.current = requestAnimationFrame(step);
        return;
      }

      scrollContainer.scrollBy(0, speed);

      const atBottom =
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 1;
      if (atBottom) {
        running.current = false;
        setTimeout(() => {
          scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => (running.current = true), pauseTop);
        }, pauseBottom);
      }

      rafId.current = requestAnimationFrame(step);
    };

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
    if (!prefersReducedMotion) {
      rafId.current = requestAnimationFrame(step);
    }

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
  }, [speed, pauseBottom, pauseTop, resumeDelay, enabled]);
}
