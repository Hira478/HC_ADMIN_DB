// app/api/workforce/planning/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function untuk kalkulasi YoY (Year on Year)
const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

// Helper function untuk menentukan status
const getStatus = (ratio: number) => {
  if (ratio >= 0.95) return "Fit";
  if (ratio >= 0.85) return "Stretch";
  return "Overload";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(searchParams.get("year") || "0");
  const month = parseInt(searchParams.get("month") || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;

  if (!companyId || !year || !month) {
    return NextResponse.json(
      { error: "Missing required filters" },
      { status: 400 }
    );
  }

  try {
    // --- Ambil Data untuk Summary Cards ---
    const currentHeadcount = await prisma.headcount.findUnique({
      where: { year_month_companyId: { year, month, companyId } },
    });
    const previousHeadcount = await prisma.headcount.findUnique({
      where: { year_month_companyId: { year: year - 1, month, companyId } },
    });

    const currentManpower = await prisma.manpowerPlanning.findUnique({
      where: { year_month_companyId: { year, month, companyId } },
    });
    const previousManpower = await prisma.manpowerPlanning.findUnique({
      where: { year_month_companyId: { year: year - 1, month, companyId } },
    });

    // --- Ambil Data untuk Tabel ---
    const totalDivisions = await prisma.divisionStat.count({
      where: { companyId, year, month },
    });
    const divisionStats = await prisma.divisionStat.findMany({
      where: { companyId, year, month },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { divisionName: "asc" },
    });

    // --- Kalkulasi & Format Data ---
    const currentPlanned = currentManpower?.plannedCount || 0;
    const currentActual = currentHeadcount?.totalCount || 0;

    const manpowerYoY = calculateYoY(
      currentPlanned,
      previousManpower?.plannedCount || 0
    );
    const headcountYoY = calculateYoY(
      currentActual,
      previousHeadcount?.totalCount || 0
    );

    const summaryData = {
      totalManpowerPlanning: {
        value: currentPlanned,
        // Gunakan fungsi format untuk string yang konsisten
        trend: formatYoYString(manpowerYoY),
      },
      totalHeadcount: {
        value: currentActual,
        // Gunakan fungsi format untuk string yang konsisten
        trend: formatYoYString(headcountYoY),
      },
      fulfilment: {
        value:
          currentPlanned > 0
            ? `${((currentActual / currentPlanned) * 100).toFixed(1)}%`
            : "0.0%",
      },
    };

    const tableData = divisionStats.map((stat) => {
      const ratio =
        stat.plannedCount > 0 ? stat.actualCount / stat.plannedCount : 0;
      return {
        division: stat.divisionName,
        manPowerPlanning: stat.plannedCount,
        headcount: stat.actualCount,
        rasio: `${(ratio * 100).toFixed(0)}%`,
        status: getStatus(ratio),
      };
    });

    const response = {
      summary: summaryData,
      table: {
        data: tableData,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(totalDivisions / pageSize),
          pageSize,
          totalData: totalDivisions,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch workforce planning data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
