import { PrismaClient, EducationStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// Fungsi ini tidak lagi digunakan, bisa dihapus
// const sumEducationStats = (stats: EducationStat[]) => { ... };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;

  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Company ID diperlukan dan harus berupa angka." },
      { status: 400 }
    );
  }

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
    const eduDataFromDb = await prisma.educationStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: {
        month: "asc",
      },
    });

    if (eduDataFromDb.length === 0) {
      return NextResponse.json({
        labels: ["S3", "S2", "S1", "D3", "< D3"],
        values: [0, 0, 0, 0, 0],
      });
    }

    // <<< MULAI LOGIKA BARU UNTUK MEMILIH DATA >>>
    let dataForPeriod: EducationStat | undefined;

    if (type === "monthly") {
      dataForPeriod = eduDataFromDb[0];
    } else {
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = eduDataFromDb.find((stat) => stat.month === latestMonth);
    }

    if (!dataForPeriod) {
      return NextResponse.json({
        labels: ["S3", "S2", "S1", "D3", "< D3"],
        values: [0, 0, 0, 0, 0],
        message: `Data edukasi untuk bulan terakhir (${Math.max(
          ...monthsToFetch
        )}) tidak ditemukan.`,
      });
    }
    // <<< AKHIR LOGIKA BARU >>>

    const labels = ["S3", "S2", "S1", "D3", "< D3"];
    // <<< GUNAKAN 'dataForPeriod' UNTUK MENGISI VALUES >>>
    const values = [
      dataForPeriod.s3Count,
      dataForPeriod.s2Count,
      dataForPeriod.s1Count,
      dataForPeriod.d3Count,
      dataForPeriod.smaSmkCount,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /education:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data edukasi." },
      { status: 500 }
    );
  }
}
