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

  // Definisikan periode kumulatif berdasarkan filter bulan
  const monthsToFetchCumulative = Array.from(
    { length: monthValue },
    (_, i) => i + 1
  );

  try {
    // --- AMBIL SEMUA DATA YANG DIPERLUKAN ---
    const [
      turnoverCumulativeCurrent,
      headcountCumulativeCurrent,
      turnoverCumulativePrevious,
      headcountCumulativePrevious,
      turnoverForChart, // Data untuk chart tetap ambil 1 tahun penuh
    ] = await Promise.all([
      prisma.turnoverStat.findMany({
        where: {
          companyId,
          year: currentYear,
          month: { in: monthsToFetchCumulative },
        },
      }),
      prisma.headcount.findMany({
        where: {
          companyId,
          year: currentYear,
          month: { in: monthsToFetchCumulative },
        },
      }),
      prisma.turnoverStat.findMany({
        where: {
          companyId,
          year: previousYear,
          month: { in: monthsToFetchCumulative },
        },
      }),
      prisma.headcount.findMany({
        where: {
          companyId,
          year: previousYear,
          month: { in: monthsToFetchCumulative },
        },
      }),
      prisma.turnoverStat.findMany({
        where: { companyId, year: currentYear },
        orderBy: { month: "asc" },
      }),
    ]);

    // --- KALKULASI KUMULATIF TAHUN INI ---
    const totalResignCurrent = turnoverCumulativeCurrent.reduce(
      (sum, item) => sum + item.resignCount,
      0
    );
    const totalHeadcountCurrent = headcountCumulativeCurrent.reduce(
      (sum, item) => sum + item.totalCount,
      0
    );
    const cumulativeRatioCurrent =
      totalHeadcountCurrent > 0
        ? (totalResignCurrent / totalHeadcountCurrent) * 100
        : 0;

    // --- KALKULASI KUMULATIF TAHUN LALU ---
    const totalResignPrevious = turnoverCumulativePrevious.reduce(
      (sum, item) => sum + item.resignCount,
      0
    );
    const totalHeadcountPrevious = headcountCumulativePrevious.reduce(
      (sum, item) => sum + item.totalCount,
      0
    );
    const cumulativeRatioPrevious =
      totalHeadcountPrevious > 0
        ? (totalResignPrevious / totalHeadcountPrevious) * 100
        : 0;

    // --- KALKULASI YoY DARI RASIO KUMULATIF ---
    const yoyPercentage = calculateYoY(
      cumulativeRatioCurrent,
      cumulativeRatioPrevious
    );

    // --- DATA UNTUK CHART (NON-KUMULATIF) ---
    const monthLabels = turnoverForChart.map((item) =>
      getMonthName(item.month)
    );
    const resignCounts = turnoverForChart.map((item) => item.resignCount);

    const response = {
      // Ganti nama properti agar lebih jelas
      cumulativeRatio: parseFloat(cumulativeRatioCurrent.toFixed(1)),
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
