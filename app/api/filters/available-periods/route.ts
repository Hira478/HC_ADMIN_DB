// File: app/api/filters/available-periods/route.ts
import { NextResponse } from "next/server";

// Definisikan tipe untuk hasil agar TypeScript tidak error
type AvailablePeriod = {
  year: number;
  month: number;
};

export async function GET() {
  try {
    // --- LOGIKA BARU: BUAT PERIODE SECARA MANUAL ---

    const availablePeriods: AvailablePeriod[] = [];
    const startYear = 2024;
    const endYear = 2025;

    // Lakukan loop dari tahun awal hingga akhir
    for (let year = startYear; year <= endYear; year++) {
      // Untuk setiap tahun, tambahkan 12 bulan
      for (let month = 1; month <= 12; month++) {
        availablePeriods.push({ year, month });
      }
    }

    // Mengurutkan hasilnya agar tahun terbaru muncul lebih dulu,
    // ini penting untuk logika 'periode default terbaru' di FilterContext Anda.
    availablePeriods.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Tahun descending (2025, 2024, 2023)
      }
      return a.month - b.month; // Bulan ascending (1, 2, 3, ...)
    });

    return NextResponse.json(availablePeriods);
  } catch (error) {
    console.error("API Error in /available-periods:", error);
    return NextResponse.json({ error: "Fail to fetch data." }, { status: 500 });
  }
}
