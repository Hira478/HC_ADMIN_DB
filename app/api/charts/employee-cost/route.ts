// File: app/api/charts/employee-cost/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";
// PERUBAHAN: Hapus import EmployeeCostStat karena tidak dipakai lagi untuk kalkulasi
import { ProductivityStat } from "@prisma/client";

const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const monthValue = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );

  try {
    const companyFilter = await getCompanyFilter(request);

    // PERUBAHAN: Kita tidak perlu lagi mengambil data dari 'EmployeeCostStat'
    /* const employeeCostStats = await prisma.employeeCostStat.findMany({
      where: { year, ...companyFilter },
      orderBy: { month: "asc" },
    });
    */

    // Kita hanya butuh data dari 'ProductivityStat' yang sudah berisi total
    const productivityStats = await prisma.productivityStat.findMany({
      where: { year, ...companyFilter },
      orderBy: { month: "asc" },
    });

    // PERUBAHAN: Hapus map untuk employeeCostStats
    // const costMap = new Map(employeeCostStats.map((s: EmployeeCostStat) => [s.month, s]));
    const prodMap = new Map(
      productivityStats.map((s: ProductivityStat) => [s.month, s])
    );

    const result = {
      months: [] as string[],
      totalEmployeeCost: [] as number[],
      totalCost: [] as number[],
    };

    for (let month = 1; month <= monthValue; month++) {
      result.months.push(getMonthName(month));

      const prodData = prodMap.get(month);

      // PERUBAHAN KUNCI DI SINI:
      // Ambil nilai 'totalEmployeeCost' langsung dari prodData, jangan dihitung ulang.
      const totalEmployeeCostForMonth = prodData
        ? prodData.totalEmployeeCost
        : 0;

      const totalCostForMonth = prodData ? prodData.totalCost : 0;

      result.totalEmployeeCost.push(totalEmployeeCostForMonth);
      result.totalCost.push(totalCostForMonth);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /charts/employee-cost:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data chart." },
      { status: 500 }
    );
  }
}
