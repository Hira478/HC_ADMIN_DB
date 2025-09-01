// File: app/api/turnover/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

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
  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const monthValue = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );
  const previousYear = currentYear - 1;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // Ambil semua data yang diperlukan
    const [
      turnoverForChart, // Semua data turnover tahun ini untuk chart
      headcountThisMonth, // Data headcount SPESIFIK bulan ini
      turnoverPreviousMonth, // Data turnover SPESIFIK bulan ini tahun lalu
      headcountPreviousMonth, // Data headcount SPESIFIK bulan ini tahun lalu
    ] = await Promise.all([
      prisma.turnoverStat.findMany({
        where: { companyId, year: currentYear },
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findUnique({
        where: {
          year_month_companyId: {
            year: currentYear,
            month: monthValue,
            companyId,
          },
        },
      }),
      prisma.turnoverStat.findUnique({
        where: {
          year_month_companyId: {
            year: previousYear,
            month: monthValue,
            companyId,
          },
        },
      }),
      prisma.headcount.findUnique({
        where: {
          year_month_companyId: {
            year: previousYear,
            month: monthValue,
            companyId,
          },
        },
      }),
    ]);

    // --- KALKULASI RASIO BULANAN ---
    // Cari data resign bulan ini dari data setahun yang sudah diambil
    const resignCountCurrent =
      turnoverForChart.find((t) => t.month === monthValue)?.resignCount ?? 0;
    const headcountCountCurrent = headcountThisMonth?.totalCount ?? 0;
    const monthlyRatioCurrent =
      headcountCountCurrent > 0
        ? (resignCountCurrent / headcountCountCurrent) * 100
        : 0;

    // --- Kalkulasi YoY ---
    const resignCountPrevious = turnoverPreviousMonth?.resignCount ?? 0;
    const headcountCountPrevious = headcountPreviousMonth?.totalCount ?? 0;
    const monthlyRatioPrevious =
      headcountCountPrevious > 0
        ? (resignCountPrevious / headcountCountPrevious) * 100
        : 0;
    const yoyPercentage = calculateYoY(
      monthlyRatioCurrent,
      monthlyRatioPrevious
    );

    // --- Data untuk chart (menggunakan data setahun penuh) ---
    const monthLabels = turnoverForChart.map((item) =>
      getMonthName(item.month)
    );
    const resignCounts = turnoverForChart.map((item) => item.resignCount);

    const response = {
      // Gunakan nama 'monthlyRatio' agar jelas
      monthlyRatio: parseFloat(monthlyRatioCurrent.toFixed(1)),
      change: formatYoYString(yoyPercentage),
      chartData: {
        categories: monthLabels,
        data: resignCounts,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /turnover:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data turnover." },
      { status: 500 }
    );
  }
}
