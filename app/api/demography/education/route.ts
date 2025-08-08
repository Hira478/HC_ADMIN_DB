import { PrismaClient, EducationStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menjumlahkan data edukasi
const sumEducationStats = (stats: EducationStat[]) => {
  return stats.reduce(
    (accumulator, current) => {
      accumulator.smaSmkCount += current.smaSmkCount;
      accumulator.d3Count += current.d3Count;
      accumulator.s1Count += current.s1Count;
      accumulator.s2Count += current.s2Count;
      accumulator.s3Count += current.s3Count;
      return accumulator;
    },
    { smaSmkCount: 0, d3Count: 0, s1Count: 0, s2Count: 0, s3Count: 0 }
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
    const eduDataFromDb = await prisma.educationStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (eduDataFromDb.length === 0) {
      return NextResponse.json({
        labels: ["< D3", "D3", "S1", "S2", "S3"],
        values: [0, 0, 0, 0, 0],
      });
    }

    const aggregatedData = sumEducationStats(eduDataFromDb);

    const labels = ["< D3", "D3", "S1", "S2", "S3"];
    const values = [
      aggregatedData.smaSmkCount,
      aggregatedData.d3Count,
      aggregatedData.s1Count,
      aggregatedData.s2Count,
      aggregatedData.s3Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /education:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data edukasi." },
      { status: 500 }
    );
  }
}
