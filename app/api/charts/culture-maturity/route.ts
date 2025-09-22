// app/api/charts/culture-maturity/route.ts

import { NextResponse } from "next/server";
import { getScoreLabel } from "@/lib/scoring";
import prisma from "@/lib/prisma";

// Tipe data yang akan dikirim ke frontend
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
  const currYearNum = parseInt(year);
  const prevYearNum = currYearNum - 1;

  try {
    const categories = [
      "Amanah",
      "Kompeten",
      "Harmonis",
      "Loyal",
      "Adaptif",
      "Kolaboratif",
    ];

    const currYearRecord = await prisma.cultureMaturityStat.findUnique({
      where: { year_companyId: { year: currYearNum, companyId: companyIdNum } },
    });

    const prevYearRecord = await prisma.cultureMaturityStat.findUnique({
      where: { year_companyId: { year: prevYearNum, companyId: companyIdNum } },
    });

    // Helper function to format data series
    const formatSeries = (
      record: {
        amanah: number;
        kompeten: number;
        harmonis: number;
        loyal: number;
        adaptif: number;
        kolaboratif: number;
      } | null
    ) =>
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

    // Hitung persentase perubahan total skor untuk trend
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
      scoreLabel: dynamicScoreLabel, // Anda bisa membuat ini dinamis jika perlu
      trend,
      chartData: {
        categories,
        seriesPrevYear: formatSeries(prevYearRecord),
        seriesCurrYear: formatSeries(currYearRecord),
      },
      prevYear: prevYearRecord ? prevYearNum : null,
      currYear: currYearNum,
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
