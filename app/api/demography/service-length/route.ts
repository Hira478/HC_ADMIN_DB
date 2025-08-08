import { PrismaClient, LengthOfServiceStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menjumlahkan data lama bekerja
const sumLosStats = (stats: LengthOfServiceStat[]) => {
  return stats.reduce(
    (acc, current) => {
      acc.los_0_5_Count += current.los_0_5_Count;
      acc.los_6_10_Count += current.los_6_10_Count;
      acc.los_11_15_Count += current.los_11_15_Count;
      acc.los_16_20_Count += current.los_16_20_Count;
      acc.los_21_25_Count += current.los_21_25_Count;
      acc.los_25_30_Count += current.los_25_30_Count;
      acc.los_over_30_Count += current.los_over_30_Count;
      return acc;
    },
    {
      los_0_5_Count: 0,
      los_6_10_Count: 0,
      los_11_15_Count: 0,
      los_16_20_Count: 0,
      los_21_25_Count: 0,
      los_25_30_Count: 0,
      los_over_30_Count: 0,
    }
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
    const losDataFromDb = await prisma.lengthOfServiceStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (losDataFromDb.length === 0) {
      return NextResponse.json({ labels: [], values: [] });
    }

    const aggregatedData = sumLosStats(losDataFromDb);

    const labels = ["0-5", "6-10", "11-15", "16-20", "21-25", "25-30", ">30"];
    const values = [
      aggregatedData.los_0_5_Count,
      aggregatedData.los_6_10_Count,
      aggregatedData.los_11_15_Count,
      aggregatedData.los_16_20_Count,
      aggregatedData.los_21_25_Count,
      aggregatedData.los_25_30_Count,
      aggregatedData.los_over_30_Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /service-length:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lama bekerja." },
      { status: 500 }
    );
  }
}
