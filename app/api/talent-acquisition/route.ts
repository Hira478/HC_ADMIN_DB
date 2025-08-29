import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // --- PERUBAHAN UTAMA DI SINI ---
    // 1. Cek dulu bulan apa saja yang ada datanya di DB untuk tahun ini
    const availableMonthsResult = await prisma.talentAcquisitionStat.findMany({
      where: { companyId, year },
      select: { month: true },
      distinct: ["month"],
      orderBy: { month: "asc" },
    });

    // Jika tidak ada data sama sekali, kirim respons kosong
    if (availableMonthsResult.length === 0) {
      return NextResponse.json({
        cards: { totalHire: 0, totalCostHire: 0 },
        charts: {
          newEmployee: { categories: [], data: [] },
          costOfHire: { categories: [], data: [] },
        },
      });
    }

    // 2. Buat array bulan HANYA dari data yang tersedia
    const monthsToFetch = availableMonthsResult.map((item) => item.month);

    // 3. Ambil data lengkap berdasarkan bulan yang tersedia tersebut
    const talentData = await prisma.talentAcquisitionStat.findMany({
      where: {
        companyId,
        year,
        month: { in: monthsToFetch },
      },
      orderBy: { month: "asc" },
    });

    // Kalkulasi untuk kartu akan tetap benar (menjumlahkan data yang ada)
    const totalHire = talentData.reduce(
      (sum, item) => sum + item.newHireCount,
      0
    );
    const totalCostHire = talentData.reduce(
      (sum, item) => sum + item.costOfHire,
      0
    );

    // Persiapan data untuk Chart
    const monthLabels = monthsToFetch.map(getMonthName);
    const newEmployeeData = talentData.map((item) => item.newHireCount);
    const costOfHireData = talentData.map((item) => item.costOfHire);

    const response = {
      cards: { totalHire, totalCostHire },
      charts: {
        newEmployee: { categories: monthLabels, data: newEmployeeData },
        costOfHire: { categories: monthLabels, data: costOfHireData },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /talent-acquisition:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
