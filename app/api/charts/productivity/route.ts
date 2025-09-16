// File: app/api/charts/productivity/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- IMPORT

const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearStr = searchParams.get("year");
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  try {
    const companyFilter = await getCompanyFilter(request); // <-- GUNAKAN FILTER

    const productivityStats = await prisma.productivityStat.findMany({
      where: { year, ...companyFilter }, // <-- TERAPKAN FILTER
      orderBy: { month: "asc" },
    });

    const headcountStats = await prisma.headcount.findMany({
      where: { year, ...companyFilter }, // <-- TERAPKAN FILTER
      orderBy: { month: "asc" },
    });

    if (productivityStats.length === 0) {
      return NextResponse.json({
        months: [],
        revenue: [],
        netProfit: [],
        revenuePerEmployee: [],
        netProfitPerEmployee: [],
      });
    }

    const headcountMap = new Map<number, number>();
    headcountStats.forEach((hc) => headcountMap.set(hc.month, hc.totalCount));

    const result = {
      months: [] as string[],
      revenue: [] as number[],
      netProfit: [] as number[],
      revenuePerEmployee: [] as number[],
      netProfitPerEmployee: [] as number[],
    };

    for (const stat of productivityStats) {
      const month = stat.month;
      const currentHeadcount = headcountMap.get(month) || 0;

      result.months.push(getMonthName(month));
      result.revenue.push(stat.revenue);
      result.netProfit.push(stat.netProfit);

      const revPerEmployee =
        currentHeadcount > 0 ? stat.revenue / currentHeadcount : 0;
      const profitPerEmployee =
        currentHeadcount > 0 ? stat.netProfit / currentHeadcount : 0;

      result.revenuePerEmployee.push(parseFloat(revPerEmployee.toFixed(2)));
      result.netProfitPerEmployee.push(
        parseFloat(profitPerEmployee.toFixed(2))
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /api/charts/productivity:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
