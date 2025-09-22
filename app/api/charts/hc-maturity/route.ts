// File: /api/charts/hc-maturity/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getHcmaScoreLabel } from "@/lib/scoring";

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

  // --- PERUBAHAN UTAMA DI SINI ---
  // Hapus logika dinamis dan atur tahun secara statis ke 2023
  const staticYear = 2023;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // Sekarang kita hanya perlu mengambil data untuk satu tahun saja
    const hcmaData = await prisma.hcmaScore.findUnique({
      where: { year_companyId: { year: staticYear, companyId } },
    });

    if (!hcmaData) {
      return NextResponse.json(
        { error: `No data ${staticYear}.` },
        { status: 404 }
      );
    }

    // Hitung skor rata-rata untuk tahun 2023
    const totalScore = hcmaIndicators.reduce(
      (sum, indicator) =>
        sum + (hcmaData[indicator as keyof typeof hcmaData] as number),
      0
    );
    const averageScore = totalScore / hcmaIndicators.length;

    const dynamicScoreLabel = getHcmaScoreLabel(averageScore);

    // Siapkan data untuk chart (hanya ada data tahun ini)
    const chartData = {
      categories: hcmaIndicators.map(toTitleCase),
      seriesPrevYear: [], // Kosongkan data tahun sebelumnya
      seriesCurrYear: hcmaIndicators.map(
        (ind) => hcmaData[ind as keyof typeof hcmaData] as number
      ),
    };

    const response = {
      title: "HC Maturity Assessment",
      mainScore: parseFloat(averageScore.toFixed(2)),
      scoreLabel: dynamicScoreLabel,
      trend: "", // YoY tidak relevan karena data statis
      ifgAverageScore: hcmaData.ifgAverageScore,
      chartData: chartData,
      prevYear: null, // Tidak ada tahun sebelumnya
      currYear: staticYear,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /hc-maturity:", error);
    return NextResponse.json({ error: "Data not found" }, { status: 500 });
  }
}
