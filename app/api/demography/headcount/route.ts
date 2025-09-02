// File: app/api/demography/headcount/route.ts

import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// --- Tambahkan fungsi helper dari API sebelumnya ---
const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const type = searchParams.get("type") || "monthly";
  const currentYear = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "1");
  const previousYear = currentYear - 1;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  // Tentukan bulan mana saja yang perlu diambil datanya
  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  // ... (logika lain untuk quarterly, semesterly, yearly tetap sama) ...
  else if (type === "quarterly") {
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
    // Ambil data untuk tahun ini dan tahun lalu secara bersamaan
    const [headcountCurrentYear, headcountPreviousYear] = await Promise.all([
      prisma.headcount.findMany({
        where: { companyId, year: currentYear, month: { in: monthsToFetch } },
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findMany({
        where: { companyId, year: previousYear, month: { in: monthsToFetch } },
        orderBy: { month: "asc" },
      }),
    ]);

    // Logika untuk mendapatkan data di akhir periode (bulan terakhir)
    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForCurrentPeriod = headcountCurrentYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );
    const dataForPreviousPeriod = headcountPreviousYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    // Dapatkan nilai total headcount untuk kedua periode
    const totalCurrent = dataForCurrentPeriod?.totalCount ?? 0;
    const totalPrevious = dataForPreviousPeriod?.totalCount ?? 0;

    // Hitung YoY dan format stringnya
    const yoyPercentage = calculateYoY(totalCurrent, totalPrevious);
    const yoyString = formatYoYString(yoyPercentage);

    // Kirim respons lengkap
    return NextResponse.json({
      total: totalCurrent,
      male: dataForCurrentPeriod?.maleCount ?? 0,
      female: dataForCurrentPeriod?.femaleCount ?? 0,
      change: yoyString, // <-- Tambahkan properti 'change'
    });
  } catch (error) {
    console.error("API Error in /headcount:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data headcount." },
      { status: 500 }
    );
  }
}
