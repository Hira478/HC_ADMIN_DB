import { PrismaClient, LengthOfServiceStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi ini tidak lagi digunakan, bisa dihapus
// const sumLosStats = (stats: LengthOfServiceStat[]) => { ... };

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
    const losDataFromDb = await prisma.lengthOfServiceStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: {
        month: "asc",
      },
    });

    const labels = ["0-5", "6-10", "11-15", "16-20", "21-25", "25-30", ">30"];

    if (losDataFromDb.length === 0) {
      return NextResponse.json({
        labels,
        values: [0, 0, 0, 0, 0, 0, 0],
      });
    }

    // <<< MULAI LOGIKA BARU UNTUK MEMILIH DATA >>>
    let dataForPeriod: LengthOfServiceStat | undefined;

    if (type === "monthly") {
      dataForPeriod = losDataFromDb[0];
    } else {
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = losDataFromDb.find((stat) => stat.month === latestMonth);
    }

    if (!dataForPeriod) {
      return NextResponse.json({
        labels,
        values: [0, 0, 0, 0, 0, 0, 0],
        message: `Data lama bekerja untuk bulan terakhir (${Math.max(
          ...monthsToFetch
        )}) tidak ditemukan.`,
      });
    }
    // <<< AKHIR LOGIKA BARU >>>

    // <<< GUNAKAN 'dataForPeriod' UNTUK MENGISI VALUES >>>
    const values = [
      dataForPeriod.los_0_5_Count,
      dataForPeriod.los_6_10_Count,
      dataForPeriod.los_11_15_Count,
      dataForPeriod.los_16_20_Count,
      dataForPeriod.los_21_25_Count,
      dataForPeriod.los_25_30_Count,
      dataForPeriod.los_over_30_Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /service-length:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lama bekerja." },
      { status: 500 }
    );
  }
}
