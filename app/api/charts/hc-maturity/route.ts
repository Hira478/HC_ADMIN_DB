// File: /api/charts/hc-maturity/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

// Daftar indikator HCMA
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

    // Persiapkan data untuk chart
    const chartData = {
      categories: hcmaIndicators.map((ind) =>
        ind.replace(/([A-Z])/g, " $1").trim()
      ), // Format nama (e.g. talentSuccession -> Talent Succession)
      data: hcmaIndicators.map(
        (ind) => hcmaCurrent[ind as keyof typeof hcmaCurrent] as number
      ),
    };

    // Hitung data untuk summary
    const totalScoreCurrent = hcmaCurrent.totalScore;
    const averageScoreCurrent = totalScoreCurrent / hcmaIndicators.length;

    const totalScorePrevious = hcmaPrevious?.totalScore ?? 0;
    const yoyPercentage = calculateYoY(totalScoreCurrent, totalScorePrevious);

    const response = {
      chartData,
      summary: {
        totalScore: parseFloat(totalScoreCurrent.toFixed(2)),
        averageScore: parseFloat(averageScoreCurrent.toFixed(2)),
        yoy: formatYoYString(yoyPercentage),
      },
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
