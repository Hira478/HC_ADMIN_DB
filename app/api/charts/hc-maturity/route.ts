// File: /api/charts/hc-maturity/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const toTitleCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const hcmaIndicators = [
  "talentSuccession",
  "rewardRecognition",
  "learningDevelopment",
  "performanceGoal",
  "capacityStrategy",
  "behaviourCulture",
  "humanCapitalIt",
  "leadership",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");

  // --- LOGIKA HIBRIDA ---
  // 1. Tahun dinamis dari filter (untuk data kartu)
  const filteredYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  // 2. Tahun statis/tetap (untuk data chart showcase)
  const showcaseCurrentYear = 2025;
  const showcasePreviousYear = 2024;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // 3. Ambil 3 set data sekaligus
    const [
      hcmaForChartCurrent, // Data 2025 untuk chart
      hcmaForChartPrevious, // Data 2024 untuk chart
      hcmaForCard, // Data dinamis (berdasarkan filter) untuk kartu
    ] = await Promise.all([
      prisma.hcmaScore.findUnique({
        where: { year_companyId: { year: showcaseCurrentYear, companyId } },
      }),
      prisma.hcmaScore.findUnique({
        where: { year_companyId: { year: showcasePreviousYear, companyId } },
      }),
      prisma.hcmaScore.findUnique({
        where: { year_companyId: { year: filteredYear, companyId } },
      }),
    ]);

    if (!hcmaForChartCurrent || !hcmaForCard) {
      return NextResponse.json(
        { error: "Data HCMA tidak ditemukan untuk tahun ini." },
        { status: 404 }
      );
    }

    // --- Kalkulasi untuk KARTU (menggunakan data dinamis) ---
    const totalScoreForCard = hcmaIndicators.reduce(
      (sum, indicator) =>
        sum + (hcmaForCard[indicator as keyof typeof hcmaForCard] as number),
      0
    );
    const averageScoreForCard = totalScoreForCard / hcmaIndicators.length;
    const ifgAverageScoreForCard = hcmaForCard.ifgAverageScore;

    // --- Siapkan data untuk CHART (menggunakan data statis) ---
    const chartData = {
      categories: hcmaIndicators.map(toTitleCase),
      seriesPrevYear: hcmaForChartPrevious
        ? hcmaIndicators.map(
            (ind) =>
              hcmaForChartPrevious[
                ind as keyof typeof hcmaForChartPrevious
              ] as number
          )
        : [],
      seriesCurrYear: hcmaIndicators.map(
        (ind) =>
          hcmaForChartCurrent[ind as keyof typeof hcmaForChartCurrent] as number
      ),
    };

    // Susun respons: gabungkan data dinamis dan statis
    const response = {
      title: "HC Maturity Assessment",
      mainScore: parseFloat(averageScoreForCard.toFixed(2)),
      scoreLabel: "Average Score",
      trend: "",
      ifgAverageScore: ifgAverageScoreForCard,
      chartData: chartData,
      prevYear: hcmaForChartPrevious ? showcasePreviousYear : null,
      currYear: showcaseCurrentYear,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /hc-maturity:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data HCMA." },
      { status: 500 }
    );
  }
}
