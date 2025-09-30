// app/api/charts/employee-engagement/route.ts

import { NextResponse } from "next/server";
import { EmployeeEngagementStat } from "@prisma/client";
import { getScoreLabel } from "@/lib/scoring";

import { CultureMaturityData as GroupedChartData } from "../culture-maturity/route";

import prisma from "@/lib/prisma";

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
    let currYearRecord = await prisma.employeeEngagementStat.findUnique({
      where: {
        year_companyId: { year: effectiveCurrYearNum, companyId: companyIdNum },
      },
    });

    // 2. Jika tidak ada, mundur satu tahun (fallback)
    if (!currYearRecord) {
      effectiveCurrYearNum = requestedYearNum - 1;
      currYearRecord = await prisma.employeeEngagementStat.findUnique({
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
    const prevYearRecord = await prisma.employeeEngagementStat.findUnique({
      where: {
        year_companyId: { year: effectivePrevYearNum, companyId: companyIdNum },
      },
    });
    // --- LOGIKA FALLBACK SELESAI ---

    const categories = ["Say", "Stay", "Strive"];
    const formatSeries = (record: EmployeeEngagementStat | null) =>
      record ? [record.say, record.stay, record.strive] : [];

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

    const responseData: GroupedChartData = {
      title: "Employee Engagement",
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
    console.error("Failed to fetch employee engagement data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
