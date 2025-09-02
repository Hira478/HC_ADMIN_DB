// File: app/api/charts/productivity/route.ts

import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// Fungsi untuk memetakan bulan (angka) ke nama bulan (string)
const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const yearStr = searchParams.get("year");

  const companyId = companyIdStr ? parseInt(companyIdStr) : null;
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan" },
      { status: 400 }
    );
  }

  try {
    // 1. Ambil data produktivitas dan headcount untuk semua bulan di tahun yang dipilih
    const productivityStats = await prisma.productivityStat.findMany({
      where: { companyId, year },
      orderBy: { month: "asc" },
    });

    const headcountStats = await prisma.headcount.findMany({
      where: { companyId, year },
      orderBy: { month: "asc" },
    });

    if (productivityStats.length === 0) {
      return NextResponse.json(
        { error: "Data produktivitas tidak ditemukan untuk periode ini" },
        { status: 404 }
      );
    }

    // 2. Buat map untuk headcount agar mudah diakses berdasarkan bulan
    const headcountMap = new Map<number, number>();
    headcountStats.forEach((hc) => {
      headcountMap.set(hc.month, hc.totalCount);
    });

    // 3. Siapkan array untuk menampung hasil
    const result = {
      months: [] as string[],
      revenue: [] as number[],
      netProfit: [] as number[],
      revenuePerEmployee: [] as number[],
      netProfitPerEmployee: [] as number[],
    };

    // 4. Iterasi melalui data produktivitas bulanan untuk menghitung semua metrik
    for (const stat of productivityStats) {
      const month = stat.month;
      const currentHeadcount = headcountMap.get(month) || 0; // Ambil headcount untuk bulan ini

      result.months.push(getMonthName(month));
      result.revenue.push(stat.revenue);
      result.netProfit.push(stat.netProfit);

      // Hitung metrik per karyawan, hindari pembagian dengan nol
      const revPerEmployee =
        currentHeadcount > 0 ? stat.revenue / currentHeadcount : 0;
      const profitPerEmployee =
        currentHeadcount > 0 ? stat.netProfit / currentHeadcount : 0;

      // Kita bulatkan ke 2 angka desimal untuk kebersihan data
      result.revenuePerEmployee.push(parseFloat(revPerEmployee.toFixed(2)));
      result.netProfitPerEmployee.push(
        parseFloat(profitPerEmployee.toFixed(2))
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error in /api/charts/productivity:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data chart produktivitas." },
      { status: 500 }
    );
  }
}
