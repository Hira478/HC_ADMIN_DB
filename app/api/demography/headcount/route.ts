import { PrismaClient, Headcount } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi ini tidak lagi digunakan, bisa dihapus
// const sumHeadcounts = (stats: Headcount[]) => { ... };

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
    const headcountDataFromDb = await prisma.headcount.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: {
        month: "asc",
      },
    });

    if (headcountDataFromDb.length === 0) {
      return NextResponse.json({ total: 0, male: 0, female: 0 });
    }

    // <<< MULAI LOGIKA BARU UNTUK MEMILIH DATA >>>
    let dataForPeriod: Headcount | undefined;

    if (type === "monthly") {
      dataForPeriod = headcountDataFromDb[0];
    } else {
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = headcountDataFromDb.find(
        (stat) => stat.month === latestMonth
      );
    }

    if (!dataForPeriod) {
      return NextResponse.json({
        total: 0,
        male: 0,
        female: 0,
        message: `Data headcount untuk bulan terakhir (${Math.max(
          ...monthsToFetch
        )}) tidak ditemukan.`,
      });
    }
    // <<< AKHIR LOGIKA BARU >>>

    // <<< GUNAKAN 'dataForPeriod' UNTUK MENGISI RESPON >>>
    return NextResponse.json({
      total: dataForPeriod.totalCount,
      male: dataForPeriod.maleCount,
      female: dataForPeriod.femaleCount,
    });
  } catch (error) {
    console.error("API Error in /headcount:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data headcount." },
      { status: 500 }
    );
  }
}
