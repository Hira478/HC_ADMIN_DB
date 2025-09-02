import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Definisikan tipe untuk hasil query mentah agar TypeScript tidak error
type AvailablePeriod = {
  year: number;
  month: number;
};

export async function GET() {
  try {
    // Kita akan menggunakan query mentah (raw query) untuk melakukan INNER JOIN
    // INNER JOIN memastikan kita hanya mendapatkan (tahun, bulan) yang ada di SEMUA tabel yang disebutkan.
    const availablePeriods: AvailablePeriod[] = await prisma.$queryRaw`
      SELECT DISTINCT
        p.year,
        p.month
      FROM
        "ProductivityStat" AS p
      INNER JOIN "Headcount" AS h
        ON p.year = h.year AND p.month = h.month
      INNER JOIN "AgeStat" AS a
        ON p.year = a.year AND p.month = a.month
      INNER JOIN "LevelStat" AS l
        ON p.year = l.year AND p.month = l.month
      INNER JOIN "EducationStat" AS e
        ON p.year = e.year AND p.month = e.month
      INNER JOIN "LengthOfServiceStat" AS los
        ON p.year = los.year AND p.month = los.month
      INNER JOIN "EmployeeStatusStat" AS es
        ON p.year = es.year AND p.month = es.month
      -- <<< Tambahkan INNER JOIN untuk tabel statistik penting lainnya di sini jika ada >>>
      ORDER BY
        p.year DESC,
        p.month ASC;
    `;

    return NextResponse.json(availablePeriods);
  } catch (error) {
    console.error("API Error in /available-periods:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data periode tersedia." },
      { status: 500 }
    );
  }
}
