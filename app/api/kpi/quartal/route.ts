import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Helper untuk aturan skor capaian (max 110%)
const calculateAdjustedScore = (score: number): number => {
  if (score > 1.1) return 1.1;
  if (score < 0) return 0;
  return score;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");

  if (!companyId || !year) {
    return NextResponse.json(
      { error: "companyId and year are required" },
      { status: 400 }
    );
  }

  try {
    const kpiDetails = await db.quartalKpi.findMany({
      where: {
        companyId: parseInt(companyId),
        year: parseInt(year),
      },
      orderBy: [{ quarter: "asc" }, { id: "asc" }],
    });

    if (kpiDetails.length === 0) {
      return NextResponse.json({
        quarterlySummary: [],
        kpiDetails: [],
      });
    }

    // Proses data untuk ringkasan per kuartal (panel kiri)
    const summary: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };

    kpiDetails.forEach((item) => {
      const adjustedScore = calculateAdjustedScore(item.achievementScore);
      const finalScore = item.weight * adjustedScore;
      summary[item.quarter] += finalScore;
    });

    const quarterlySummary = Object.entries(summary)
      .map(([quarter, totalScore]) => ({
        quarter: `Q${quarter}`,
        score: totalScore * 100, // Kirim sebagai persen, misal 95.2
      }))
      // Hanya tampilkan kuartal yang memiliki data
      .filter((q) =>
        kpiDetails.some((item) => `Q${item.quarter}` === q.quarter)
      );

    return NextResponse.json({
      quarterlySummary,
      kpiDetails, // Kirim juga data mentah untuk tabel
    });
  } catch (error) {
    console.error("Failed to fetch quarterly KPI data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
