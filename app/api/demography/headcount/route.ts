// File: app/api/demography/headcount/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- IMPORT

const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "monthly";
  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );
  const previousYear = currentYear - 1;

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  // ... logika lain untuk quarterly, dll ...
  else if (type === "yearly") {
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  try {
    const companyFilter = await getCompanyFilter(request); // <-- GUNAKAN FILTER

    const [headcountCurrentYear, headcountPreviousYear] = await Promise.all([
      prisma.headcount.findMany({
        where: {
          year: currentYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        }, // <-- TERAPKAN FILTER
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findMany({
        where: {
          year: previousYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        }, // <-- TERAPKAN FILTER
        orderBy: { month: "asc" },
      }),
    ]);

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForCurrentPeriod = headcountCurrentYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );
    const dataForPreviousPeriod = headcountPreviousYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    const totalCurrent = dataForCurrentPeriod?.totalCount ?? 0;
    const totalPrevious = dataForPreviousPeriod?.totalCount ?? 0;
    const yoyPercentage = calculateYoY(totalCurrent, totalPrevious);
    const yoyString = formatYoYString(yoyPercentage);

    return NextResponse.json({
      total: totalCurrent,
      male: dataForCurrentPeriod?.maleCount ?? 0,
      female: dataForCurrentPeriod?.femaleCount ?? 0,
      change: yoyString,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /headcount:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
