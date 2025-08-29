// File: app/api/talent-acquisition/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  // 1. Ambil 'value' (bulan) dari filter yang dikirim frontend
  const monthValue = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // Ambil semua data untuk tahun yang dipilih (untuk chart & kalkulasi total)
    const talentDataForYear = await prisma.talentAcquisitionStat.findMany({
      where: { companyId, year },
      orderBy: { month: "asc" },
    });

    if (talentDataForYear.length === 0) {
      // Handle jika tidak ada data sama sekali
      return NextResponse.json({
        cards: { totalHire: 0, totalCostHire: 0, newHireRetention: 0 },
        charts: {
          newEmployee: { categories: [], data: [] },
          costOfHire: { categories: [], data: [] },
        },
      });
    }

    // Kalkulasi untuk Kartu Total (tetap menjumlahkan semua data yang ada di tahun itu)
    const totalHire = talentDataForYear.reduce(
      (sum, item) => sum + item.newHireCount,
      0
    );
    const totalCostHire = talentDataForYear.reduce(
      (sum, item) => sum + item.costOfHire,
      0
    );

    // --- PERBAIKAN LOGIKA DI SINI ---
    // 2. Cari data spesifik untuk bulan yang dipilih dari filter (`monthValue`)
    const selectedMonthData = talentDataForYear.find(
      (d) => d.month === monthValue
    );

    // 3. Gunakan data bulan tersebut untuk New Hire Retention
    const newHireRetention = selectedMonthData?.newHireRetention ?? 0;

    // Persiapan data untuk Chart (tetap menampilkan semua bulan yang ada datanya)
    const availableMonths = talentDataForYear.map((item) => item.month);
    const monthLabels = availableMonths.map(getMonthName);
    const newEmployeeData = talentDataForYear.map((item) => item.newHireCount);
    const costOfHireData = talentDataForYear.map((item) => item.costOfHire);

    const response = {
      cards: {
        totalHire,
        totalCostHire,
        newHireRetention,
      },
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
