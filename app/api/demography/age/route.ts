import { PrismaClient, AgeStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const sumAgeStats = (stats: AgeStat[]) => {
  return stats.reduce(
    (accumulator, currentStat) => {
      accumulator.under25Count += currentStat.under25Count;
      accumulator.age26to40Count += currentStat.age26to40Count;
      accumulator.age41to50Count += currentStat.age41to50Count;
      accumulator.over50Count += currentStat.over50Count;
      return accumulator;
    },
    {
      under25Count: 0,
      age26to40Count: 0,
      age41to50Count: 0,
      over50Count: 0,
    }
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  let monthsToFetch: number[] = [];
  if (type === "monthly") {
    monthsToFetch = [value];
  } else if (type === "quarterly") {
    const quarterMonths = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ];
    monthsToFetch = quarterMonths[value - 1] || [];
  } else if (type === "semesterly") {
    const semesterMonths = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12],
    ];
    monthsToFetch = semesterMonths[value - 1] || [];
  } else if (type === "yearly") {
    // --- TAMBAHKAN BLOK INI ---
    monthsToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    // -------------------------
  }

  try {
    const ageDataFromDb = await prisma.ageStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (ageDataFromDb.length === 0) {
      return NextResponse.json({
        labels: [">50", "41-50", "26-40", "<25"],
        values: [0, 0, 0, 0],
      });
    }

    const aggregatedData = sumAgeStats(ageDataFromDb);

    const labels = [">50", "41-50", "26-40", "<25"];
    const values = [
      aggregatedData.over50Count,
      aggregatedData.age41to50Count,
      aggregatedData.age26to40Count,
      aggregatedData.under25Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /age:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data usia." },
      { status: 500 }
    );
  }
}
