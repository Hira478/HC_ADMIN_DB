// app/api/charts/employee-engagement/route.ts

import { NextResponse } from "next/server";
import { EmployeeEngagementStat } from "@prisma/client";

// Kita bisa gunakan kembali tipe data ini karena strukturnya sama
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
  const currYearNum = parseInt(year);
  const prevYearNum = currYearNum - 1;

  try {
    const categories = ["Say", "Stay", "Strive"];

    const currYearRecord = await prisma.employeeEngagementStat.findUnique({
      where: { year_companyId: { year: currYearNum, companyId: companyIdNum } },
    });

    const prevYearRecord = await prisma.employeeEngagementStat.findUnique({
      where: { year_companyId: { year: prevYearNum, companyId: companyIdNum } },
    });

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

    const responseData: GroupedChartData = {
      title: "Employee Engagement",
      mainScore: currYearRecord?.totalScore.toFixed(1) || "N/A",
      scoreLabel: "Moderate High",
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
    console.error("Failed to fetch employee engagement data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
