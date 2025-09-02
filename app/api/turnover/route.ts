// File: app/api/turnover/route.ts

import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

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

  // Definisikan periode kumulatif berdasarkan filter bulan
  const monthsToFetchCumulative = Array.from(
    { length: monthValue },
    (_, i) => i + 1
  );

  try {
    const [
      turnoverCumulativeCurrent,
      headcountCurrentMonth,
      turnoverCumulativePrevious,
      headcountPreviousMonth,
      turnoverForChart,
    ] = await Promise.all([
      prisma.turnoverStat.findMany({
        where: {
          companyId,
          year: currentYear,
          month: { in: monthsToFetchCumulative },
        },
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
      prisma.turnoverStat.findMany({
        where: {
          companyId,
          year: previousYear,
          month: { in: monthsToFetchCumulative },
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
      prisma.turnoverStat.findMany({
        where: { companyId, year: currentYear },
        orderBy: { month: "asc" },
      }),
    ]);

    // --- KALKULASI YTD TAHUN INI ---
    const totalResignCurrent = turnoverCumulativeCurrent.reduce(
      (sum, item) => sum + item.resignCount,
      0
    );
    const headcountCountCurrent = headcountCurrentMonth?.totalCount ?? 0;
    const ytdRatioCurrent =
      headcountCountCurrent > 0
        ? (totalResignCurrent / headcountCountCurrent) * 100
        : 0;

    // --- KALKULASI YTD TAHUN LALU ---
    const totalResignPrevious = turnoverCumulativePrevious.reduce(
      (sum, item) => sum + item.resignCount,
      0
    );
    const headcountCountPrevious = headcountPreviousMonth?.totalCount ?? 0;
    const ytdRatioPrevious =
      headcountCountPrevious > 0
        ? (totalResignPrevious / headcountCountPrevious) * 100
        : 0;

    // --- KALKULASI YoY DARI RASIO YTD ---
    const yoyPercentage = calculateYoY(ytdRatioCurrent, ytdRatioPrevious);

    // --- DATA UNTUK CHART (NON-KUMULATIF) ---
    const monthLabels = turnoverForChart.map((item) =>
      getMonthName(item.month)
    );
    const resignCounts = turnoverForChart.map((item) => item.resignCount);

    const response = {
      ytdRatio: parseFloat(ytdRatioCurrent.toFixed(1)),
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
