// app/api/charts/culture-maturity/route.ts

import { NextResponse } from "next/server";
import { getScoreLabel } from "@/lib/scoring";
import prisma from "@/lib/prisma";
import { CultureMaturityStat } from "@prisma/client"; // Import tipe

export interface CultureMaturityData {
  title: string;
  mainScore: string;
  scoreLabel: string;
  trend: string;
  chartData: {
    categories: string[];
    seriesPrevYear: number[];
    seriesCurrYear: number[];
  };
  prevYear: number | null;
  currYear: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");

  if (!companyId || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const companyIdNum = parseInt(companyId);
  const requestedYearNum = parseInt(year);

  try {
    // --- LOGIKA FALLBACK DIMULAI ---
    let effectiveCurrYearNum = requestedYearNum;

    // 1. Coba ambil data untuk tahun yang diminta
    let currYearRecord = await prisma.cultureMaturityStat.findUnique({
      where: {
        year_companyId: { year: effectiveCurrYearNum, companyId: companyIdNum },
      },
    });

    // 2. Jika tidak ada, mundur satu tahun (fallback)
    if (!currYearRecord) {
      effectiveCurrYearNum = requestedYearNum - 1;
      currYearRecord = await prisma.cultureMaturityStat.findUnique({
        where: {
          year_companyId: {
            year: effectiveCurrYearNum,
            companyId: companyIdNum,
          },
        },
      });
    }

    // 3. Ambil data tahun sebelumnya berdasarkan tahun efektif
    const effectivePrevYearNum = effectiveCurrYearNum - 1;
    const prevYearRecord = await prisma.cultureMaturityStat.findUnique({
      where: {
        year_companyId: { year: effectivePrevYearNum, companyId: companyIdNum },
      },
    });
    // --- LOGIKA FALLBACK SELESAI ---

    const categories = [
      "Amanah",
      "Kompeten",
      "Harmonis",
      "Loyal",
      "Adaptif",
      "Kolaboratif",
    ];

    const formatSeries = (record: CultureMaturityStat | null) =>
      record
        ? [
            record.amanah,
            record.kompeten,
            record.harmonis,
            record.loyal,
            record.adaptif,
            record.kolaboratif,
          ]
        : [];

    let trend = "+0% | Year on Year";
    if (currYearRecord && prevYearRecord && prevYearRecord.totalScore > 0) {
      const percentageChange =
        ((currYearRecord.totalScore - prevYearRecord.totalScore) /
          prevYearRecord.totalScore) *
        100;
      trend = `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(
        0
      )}% | Year on Year`;
    }

    const currentScore = currYearRecord?.totalScore ?? 0;
    const dynamicScoreLabel = getScoreLabel(currentScore);

    const responseData: CultureMaturityData = {
      title: "Culture Maturity",
      mainScore: currYearRecord?.totalScore.toFixed(1) || "N/A",
      scoreLabel: dynamicScoreLabel,
      trend,
      chartData: {
        categories,
        seriesPrevYear: formatSeries(prevYearRecord),
        seriesCurrYear: formatSeries(currYearRecord),
      },
      // Gunakan tahun efektif untuk response
      prevYear: prevYearRecord ? effectivePrevYearNum : null,
      currYear: effectiveCurrYearNum,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch culture maturity data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
