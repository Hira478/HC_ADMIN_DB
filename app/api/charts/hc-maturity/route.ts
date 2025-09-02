// File: /api/charts/hc-maturity/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

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
  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const previousYear = currentYear - 1;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    const [hcmaCurrent, hcmaPrevious] = await Promise.all([
      prisma.hcmaScore.findUnique({
        where: { year_companyId: { year: currentYear, companyId } },
      }),
      prisma.hcmaScore.findUnique({
        where: { year_companyId: { year: previousYear, companyId } },
      }),
    ]);

    if (!hcmaCurrent) {
      return NextResponse.json(
        { error: "Data HCMA tidak ditemukan untuk tahun ini." },
        { status: 404 }
      );
    }

    // Hitung skor rata-rata
    const totalScoreCurrent = hcmaIndicators.reduce(
      (sum, indicator) =>
        sum + (hcmaCurrent[indicator as keyof typeof hcmaCurrent] as number),
      0
    );
    const averageScoreCurrent = totalScoreCurrent / hcmaIndicators.length;

    // Siapkan data untuk grouped bar chart
    const chartData = {
      categories: hcmaIndicators.map(toTitleCase),
      seriesPrevYear: hcmaPrevious
        ? hcmaIndicators.map(
            (ind) => hcmaPrevious[ind as keyof typeof hcmaPrevious] as number
          )
        : [],
      seriesCurrYear: hcmaIndicators.map(
        (ind) => hcmaCurrent[ind as keyof typeof hcmaCurrent] as number
      ),
    };

    // Susun respons agar sesuai dengan yang dibutuhkan komponen GroupedBarChart
    const response = {
      title: "HC Maturity Assessment",
      mainScore: parseFloat(averageScoreCurrent.toFixed(2)),
      scoreLabel: "Average Score",
      trend: "", // Trend bisa ditambahkan nanti jika perlu
      chartData: chartData,
      prevYear: hcmaPrevious ? previousYear : null,
      currYear: currentYear,
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
