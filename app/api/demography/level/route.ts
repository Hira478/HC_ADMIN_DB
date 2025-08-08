import { PrismaClient, LevelStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menjumlahkan data level
const sumLevelStats = (stats: LevelStat[]) => {
  return stats.reduce(
    (accumulator, current) => {
      accumulator.bod1Count += current.bod1Count;
      accumulator.bod2Count += current.bod2Count;
      accumulator.bod3Count += current.bod3Count;
      accumulator.bod4Count += current.bod4Count;
      return accumulator;
    },
    { bod1Count: 0, bod2Count: 0, bod3Count: 0, bod4Count: 0 }
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;

  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Company ID diperlukan dan harus berupa angka." },
      { status: 400 }
    );
  }

  // Tentukan rentang bulan berdasarkan tipe filter
  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "quarterly")
    monthsToFetch =
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ][value - 1] || [];
  else if (type === "semesterly")
    monthsToFetch =
      [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ][value - 1] || [];
  else if (type === "yearly")
    monthsToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  try {
    const levelDataFromDb = await prisma.levelStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (levelDataFromDb.length === 0) {
      return NextResponse.json({
        labels: ["BOD-1", "BOD-2", "BOD-3", "BOD-4"],
        values: [0, 0, 0, 0],
      });
    }

    const aggregatedData = sumLevelStats(levelDataFromDb);

    const labels = ["BOD-1", "BOD-2", "BOD-3", "BOD-4"];
    const values = [
      aggregatedData.bod1Count,
      aggregatedData.bod2Count,
      aggregatedData.bod3Count,
      aggregatedData.bod4Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /level:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data level jabatan." },
      { status: 500 }
    );
  }
}
