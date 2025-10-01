import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";
import { EmployeeCostStat } from "@prisma/client";

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

  try {
    const companyFilter = await getCompanyFilter(request);

    const employeeCostStats = await prisma.employeeCostStat.findMany({
      where: {
        year,
        ...companyFilter,
      },
      orderBy: {
        month: "asc",
      },
    });

    const costMap = new Map(
      employeeCostStats.map((stat: EmployeeCostStat) => [stat.month, stat])
    );

    const labels = Array.from({ length: 12 }, (_, i) => getMonthName(i + 1));
    const datasets = {
      managementCost: [] as number[],
      employeeCost: [] as number[],
      recruitment: [] as number[],
      secondment: [] as number[],
      others: [] as number[],
    };

    for (let month = 1; month <= 12; month++) {
      const dataForMonth = costMap.get(month);

      datasets.managementCost.push(dataForMonth?.managementCost ?? 0);
      datasets.employeeCost.push(dataForMonth?.employeeCost ?? 0);
      datasets.recruitment.push(dataForMonth?.recruitment ?? 0);
      datasets.secondment.push(dataForMonth?.secondment ?? 0);
      datasets.others.push(dataForMonth?.others ?? 0);
    }

    return NextResponse.json({ labels, datasets });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /charts/employee-cost-breakdown:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data rincian employee cost." },
      { status: 500 }
    );
  }
}
