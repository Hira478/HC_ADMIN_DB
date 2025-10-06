// File: app/api/demography/headcount/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
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
  // ## 1. BACA FILTER STATUS DARI URL ##
  const status = searchParams.get("status") || "all";

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const companyFilter = await getCompanyFilter(request);

    // ## 2. AMBIL DATA LEBIH DETAIL UNTUK TAHUN SEBELUMNYA (untuk kalkulasi YoY) ##
    const [headcountCurrentYear, headcountPreviousYear] = await Promise.all([
      prisma.headcount.findMany({
        where: {
          year: currentYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
        select: {
          month: true,
          totalCount: true,
          malePermanent: true,
          maleContract: true,
          femalePermanent: true,
          femaleContract: true,
        },
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findMany({
        where: {
          year: previousYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
        // Ambil juga detail permanent/contract untuk tahun sebelumnya
        select: {
          month: true,
          totalCount: true,
          malePermanent: true,
          maleContract: true,
          femalePermanent: true,
          femaleContract: true,
        },
        orderBy: { month: "asc" },
      }),
    ]);

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataCurrent = headcountCurrentYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );
    const dataPrevious = headcountPreviousYear.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    // Kalkulasi basis
    const permanentTotalCurrent =
      (dataCurrent?.malePermanent ?? 0) + (dataCurrent?.femalePermanent ?? 0);
    const contractTotalCurrent =
      (dataCurrent?.maleContract ?? 0) + (dataCurrent?.femaleContract ?? 0);
    const overallTotalCurrent = permanentTotalCurrent + contractTotalCurrent;

    const permanentTotalPrevious =
      (dataPrevious?.malePermanent ?? 0) + (dataPrevious?.femalePermanent ?? 0);
    const contractTotalPrevious =
      (dataPrevious?.maleContract ?? 0) + (dataPrevious?.femaleContract ?? 0);
    const overallTotalPrevious = permanentTotalPrevious + contractTotalPrevious;

    // ## 3. TENTUKAN DATA YANG AKAN DIKIRIM BERDASARKAN FILTER STATUS ##
    let responseTotal = 0;
    let responseMale = 0;
    let responseFemale = 0;
    let yoyPercentage = 0;

    switch (status) {
      case "permanent":
        responseTotal = permanentTotalCurrent;
        responseMale = dataCurrent?.malePermanent ?? 0;
        responseFemale = dataCurrent?.femalePermanent ?? 0;
        yoyPercentage = calculateYoY(
          permanentTotalCurrent,
          permanentTotalPrevious
        );
        break;
      case "contract":
        responseTotal = contractTotalCurrent;
        responseMale = dataCurrent?.maleContract ?? 0;
        responseFemale = dataCurrent?.femaleContract ?? 0;
        yoyPercentage = calculateYoY(
          contractTotalCurrent,
          contractTotalPrevious
        );
        break;
      default: // 'all'
        responseTotal = overallTotalCurrent;
        responseMale =
          (dataCurrent?.malePermanent ?? 0) + (dataCurrent?.maleContract ?? 0);
        responseFemale =
          (dataCurrent?.femalePermanent ?? 0) +
          (dataCurrent?.femaleContract ?? 0);
        yoyPercentage = calculateYoY(overallTotalCurrent, overallTotalPrevious);
        break;
    }

    const yoyString = formatYoYString(yoyPercentage);

    // ## 4. KIRIM RESPON YANG SUDAH TERFILTER, NAMUN TETAP LENGKAP ##
    return NextResponse.json({
      // Data level atas sudah terfilter
      total: responseTotal,
      male: responseMale,
      female: responseFemale,
      change: yoyString,
      // Data detail tetap dikirim untuk komponen lain (seperti tooltip & pie chart)
      permanent: {
        total: permanentTotalCurrent,
        male: dataCurrent?.malePermanent ?? 0,
        female: dataCurrent?.femalePermanent ?? 0,
      },
      contract: {
        total: contractTotalCurrent,
        male: dataCurrent?.maleContract ?? 0,
        female: dataCurrent?.femaleContract ?? 0,
      },
    });
  } catch (error: unknown) {
    // ... (error handling tetap sama)
  }
}
