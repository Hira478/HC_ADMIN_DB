import { PrismaClient, Headcount } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menjumlahkan data headcount
const sumHeadcounts = (stats: Headcount[]) => {
  return stats.reduce(
    (accumulator, current) => {
      accumulator.totalCount += current.totalCount;
      accumulator.maleCount += current.maleCount;
      accumulator.femaleCount += current.femaleCount;
      return accumulator;
    },
    { totalCount: 0, maleCount: 0, femaleCount: 0 }
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
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const headcountDataFromDb = await prisma.headcount.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (headcountDataFromDb.length === 0) {
      return NextResponse.json({ total: 0, male: 0, female: 0 });
    }

    // Lakukan agregasi (penjumlahan)
    const aggregatedData = sumHeadcounts(headcountDataFromDb);

    return NextResponse.json({
      total: aggregatedData.totalCount,
      male: aggregatedData.maleCount,
      female: aggregatedData.femaleCount,
    });
  } catch (error) {
    console.error("API Error in /headcount:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data headcount." },
      { status: 500 }
    );
  }
}
