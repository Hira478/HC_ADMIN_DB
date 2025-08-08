import { PrismaClient, LevelStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi ini tidak lagi digunakan, bisa dihapus
// const sumLevelStats = (stats: LevelStat[]) => { ... };

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
    const levelDataFromDb = await prisma.levelStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
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

    // <<< MULAI LOGIKA BARU UNTUK MEMILIH DATA >>>
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
    // <<< AKHIR LOGIKA BARU >>>

    const labels = ["BOD-1", "BOD-2", "BOD-3", "BOD-4"];
    // <<< GUNAKAN 'dataForPeriod' UNTUK MENGISI VALUES >>>
    const values = [
      dataForPeriod.bod1Count,
      dataForPeriod.bod2Count,
      dataForPeriod.bod3Count,
      dataForPeriod.bod4Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /level:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data level jabatan." },
      { status: 500 }
    );
  }
}
