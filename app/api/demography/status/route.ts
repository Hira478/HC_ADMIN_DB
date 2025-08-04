import { PrismaClient, EmployeeStatusStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menjumlahkan data status
const sumStatusStats = (stats: EmployeeStatusStat[]) => {
  return stats.reduce(
    (accumulator, current) => {
      accumulator.permanentCount += current.permanentCount;
      accumulator.contractCount += current.contractCount;
      return accumulator;
    },
    { permanentCount: 0, contractCount: 0 }
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

  // Tentukan rentang bulan berdasarkan tipe filter
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
  }

  try {
    const statusDataFromDb = await prisma.employeeStatusStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (statusDataFromDb.length === 0) {
      return NextResponse.json([]);
    }

    // Lakukan agregasi (penjumlahan)
    const aggregatedData = sumStatusStats(statusDataFromDb);

    const dataForChart = [
      {
        name: "Permanent",
        value: aggregatedData.permanentCount,
        itemStyle: { color: "#C53030" },
        label: { show: false },
      },
      {
        name: "Contract",
        value: aggregatedData.contractCount,
        itemStyle: { color: "#4A5568" },
        label: { show: false },
      },
    ];

    return NextResponse.json(dataForChart);
  } catch (error) {
    console.error("API Error in /status:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status." },
      { status: 500 }
    );
  }
}
