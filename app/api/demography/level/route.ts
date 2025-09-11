// Asumsi path file: app/api/charts/level/route.ts

import { LevelStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- 1. IMPORT HELPER

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // --- 2. HAPUS semua logika companyId dari URL ---
  // const companyIdStr = searchParams.get("companyId");
  // const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;

  const type = searchParams.get("type") || "monthly";
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );

  // Hapus pengecekan companyId lama
  // if (!companyId || isNaN(companyId)) { ... }

  let monthsToFetch: number[] = [];
  if (type === "monthly") {
    monthsToFetch = [value];
  } else if (type === "quarterly") {
    const quarterMonths = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ];
    monthsToFetch = quarterMonths[value - 1] || [];
  } else if (type === "semesterly") {
    const semesterMonths = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12],
    ];
    monthsToFetch = semesterMonths[value - 1] || [];
  } else if (type === "yearly") {
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  try {
    // --- 3. PANGGIL HELPER KEAMANAN ---
    const companyFilter = await getCompanyFilter();

    const levelDataFromDb = await prisma.levelStat.findMany({
      // --- 4. GUNAKAN companyFilter ---
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      orderBy: {
        month: "asc",
      },
    });

    if (levelDataFromDb.length === 0) {
      return NextResponse.json({
        labels: ["BOD-1", "BOD-2", "BOD-3", "BOD-4"],
        values: [0, 0, 0, 0],
      });
    }

    // Sisa logika tidak berubah, sudah benar
    let dataForPeriod: LevelStat | undefined;
    if (type === "monthly") {
      dataForPeriod = levelDataFromDb[0];
    } else {
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = levelDataFromDb.find(
        (stat) => stat.month === latestMonth
      );
    }

    if (!dataForPeriod) {
      return NextResponse.json({
        labels: ["BOD-1", "BOD-2", "BOD-3", "BOD-4"],
        values: [0, 0, 0, 0],
        message: `Data level jabatan untuk bulan terakhir (${Math.max(
          ...monthsToFetch
        )}) tidak ditemukan.`,
      });
    }

    const labels = ["BOD-1", "BOD-2", "BOD-3", "BOD-4"];
    const values = [
      dataForPeriod.bod1Count,
      dataForPeriod.bod2Count,
      dataForPeriod.bod3Count,
      dataForPeriod.bod4Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error: unknown) {
    // <-- 5. Perbarui blok catch
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /level:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data level jabatan." },
      { status: 500 }
    );
  }
}
