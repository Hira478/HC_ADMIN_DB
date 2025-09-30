// File: /api/charts/hc-maturity/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getHcmaScoreInfo } from "@/lib/scoring";

// 1. HAPUS FUNGSI toTitleCase
/*
const toTitleCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
*/

// 2. UBAH hcmaIndicators MENJADI ARRAY OF OBJECTS (key & name)
const hcmaIndicators = [
  { key: "talentSuccession", name: "Talent Succession" },
  { key: "rewardRecognition", name: "Reward Recognition" },
  { key: "learningDevelopment", name: "Learning Development" },
  { key: "performanceGoal", name: "Performance Goal" },
  { key: "capacityStrategy", name: "Capacity Strategy" },
  { key: "behaviourCulture", name: "Behaviour Culture" },
  { key: "humanCapitalIt", name: "Human Capital IT" }, // <-- PERBAIKAN DI SINI
  { key: "leadership", name: "Leadership" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const staticYear = 2023;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    const hcmaData = await prisma.hcmaScore.findUnique({
      where: { year_companyId: { year: staticYear, companyId } },
    });

    if (!hcmaData) {
      return NextResponse.json(
        { error: `No data ${staticYear}.` },
        { status: 404 }
      );
    }

    // 3. SESUAIKAN KALKULASI totalScore untuk menggunakan `indicator.key`
    const totalScore = hcmaIndicators.reduce(
      (sum, indicator) =>
        sum + (hcmaData[indicator.key as keyof typeof hcmaData] as number),
      0
    );
    const averageScore = totalScore / hcmaIndicators.length;

    const scoreInfo = getHcmaScoreInfo(averageScore);

    // 4. SESUAIKAN PEMBUATAN chartData
    const chartData = {
      // Ambil 'name' untuk categories
      categories: hcmaIndicators.map((indicator) => indicator.name),
      seriesPrevYear: [],
      // Ambil data dari 'key' untuk seriesCurrYear
      seriesCurrYear: hcmaIndicators.map(
        (indicator) =>
          hcmaData[indicator.key as keyof typeof hcmaData] as number
      ),
    };

    const response = {
      title: "HC Maturity Assessment",
      mainScore: parseFloat(averageScore.toFixed(2)),
      scoreInfo: scoreInfo,
      trend: "",
      ifgAverageScore: hcmaData.ifgAverageScore,
      chartData: chartData,
      prevYear: null,
      currYear: staticYear,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /hc-maturity:", error);
    return NextResponse.json({ error: "Data not found" }, { status: 500 });
  }
}
