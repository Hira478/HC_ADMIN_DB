import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// --- PERUBAHAN 1: Definisikan kategori standar dan urutannya ---
// Urutan ini akan menjadi urutan final di chart Anda
const STANDARD_CATEGORIES = [
  // Kelompok Enabler
  "IT",
  "HC & GA",
  "Finance",
  "Compliance",
  // Kelompok Revenue Generator
  "Strategy",
  "Business",
  "Operation",
];

// Peta untuk menormalisasi nama kategori dari database ke nama standar
const categoryMap: { [key: string]: string } = {
  strategy: "Strategy",
  business: "Business",
  finance: "Finance",
  "hc, ga & sekper": "HC & GA", // Normalisasi dari 'HC, GA & Sekper'
  operation: "Operation",
  compliance: "Compliance",
  it: "IT",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!companyId || !year || !month) {
    return NextResponse.json(
      { error: "companyId, year, and month are required" },
      { status: 400 }
    );
  }

  try {
    const divisionStats = await prisma.divisionStat.findMany({
      where: {
        companyId: parseInt(companyId),
        year: parseInt(year),
        month: parseInt(month),
      },
    });

    // --- PERUBAHAN 2: Saring (filter) data dengan Kategori 'Umum' ---
    const filteredStats = divisionStats.filter(
      (stat) => stat.Kategori.toLowerCase() !== "umum"
    );

    console.log(
      `[LANGKAH 1] Ditemukan ${divisionStats.length} baris total, ${filteredStats.length} baris valid (setelah filter 'Umum').`
    );

    if (filteredStats.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { currentPage: 1, totalPages: 1 },
      });
    }

    const totalHeadcount = filteredStats.reduce(
      (sum, stat) => sum + stat.actualCount,
      0
    );

    console.log(
      `[LANGKAH 2] Total Headcount dari semua divisi valid: ${totalHeadcount}.`
    );

    // --- PERUBAHAN 3: Agregasi menggunakan nama yang sudah dinormalisasi ---
    const headcountByCategory = new Map<string, number>();
    for (const stat of filteredStats) {
      const normalizedCategory = categoryMap[stat.Kategori.toLowerCase()];
      if (normalizedCategory) {
        const currentCount = headcountByCategory.get(normalizedCategory) || 0;
        headcountByCategory.set(
          normalizedCategory,
          currentCount + stat.actualCount
        );
      }
    }

    console.log(
      "[LANGKAH 3] Hasil Agregasi Headcount per Kategori:",
      Object.fromEntries(headcountByCategory)
    );

    console.log(`[LANGKAH 4] Menghitung rasio final...`);

    // --- PERUBAHAN 4: Susun data final berdasarkan urutan standar ---
    const chartDataRows = STANDARD_CATEGORIES.map((category) => {
      const count = headcountByCategory.get(category) || 0;
      const ratio = totalHeadcount > 0 ? (count / totalHeadcount) * 100 : 0;

      console.log(
        `  - Rasio untuk '${category}': (${count} / ${totalHeadcount}) * 100 = ${ratio.toFixed(
          1
        )}%`
      );

      return {
        jobFamily: category,
        rasio: ratio.toFixed(1),
        market: "N/A",
        rasioGap: 0,
      };
    });

    console.log(
      "[HASIL AKHIR] Mengirim data berikut ke frontend:",
      chartDataRows
    );
    console.log(`--- [PERHITUNGAN FORMASI SELESAI] ---\n`);

    return NextResponse.json({
      data: chartDataRows,
      meta: { currentPage: 1, totalPages: 1 },
    });
  } catch (error) {
    console.error("Error fetching formation rasio from division stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
