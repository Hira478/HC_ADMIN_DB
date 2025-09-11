// File: app/api/productivity/metrics/route.ts

import { ProductivityStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- 1. IMPORT HELPER KEAMANAN

// Fungsi-fungsi helper (sumProductivity, formatCurrency, dll) tidak perlu diubah
const sumProductivity = (stats: ProductivityStat[]) =>
  stats.reduce(
    (acc, current) => {
      acc.revenue += current.revenue;
      acc.netProfit += current.netProfit;
      acc.totalEmployeeCost += current.totalEmployeeCost;
      acc.totalCost += current.totalCost;
      return acc;
    },
    { revenue: 0, netProfit: 0, totalEmployeeCost: 0, totalCost: 0 }
  );

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const integerValue = Math.trunc(absValue);
  const formattedNumber = integerValue.toLocaleString("id-ID");
  return `${sign}Rp ${formattedNumber}`;
};

const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // --- 2. HAPUS baris ini, kita tidak akan mengambil companyId dari klien lagi ---
  // const companyId = parseInt(searchParams.get("companyId") || "0");

  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const monthValue = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );
  const previousYear = currentYear - 1;

  if (!currentYear || !monthValue) {
    return NextResponse.json(
      { error: "Parameter 'year' dan 'month' diperlukan." },
      { status: 400 }
    );
  }

  const monthsToFetch: number[] = Array.from(
    { length: monthValue },
    (_, i) => i + 1
  );

  try {
    // --- 3. PANGGIL HELPER KEAMANAN UNTUK MENDAPATKAN FILTER PERUSAHAAN ---
    const companyFilter = await getCompanyFilter();

    const [
      currentYearProductivity,
      previousYearProductivity,
      currentYearHeadcount,
      previousYearHeadcount,
    ] = await Promise.all([
      prisma.productivityStat.findMany({
        // --- 4. GUNAKAN companyFilter DI SEMUA QUERY ---
        where: {
          year: currentYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
      }),
      prisma.productivityStat.findMany({
        where: {
          year: previousYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
      }),
      prisma.headcount.findFirst({
        where: { year: currentYear, month: monthValue, ...companyFilter },
      }),
      prisma.headcount.findFirst({
        where: { year: previousYear, month: monthValue, ...companyFilter },
      }),
    ]);

    // --- Sisa dari logika Anda tidak perlu diubah, sudah benar ---
    const totalProductivityCurrent = sumProductivity(currentYearProductivity);
    const headcountCurrent = currentYearHeadcount?.totalCount || 0;
    const costPerEmployeeCurrent =
      headcountCurrent > 0
        ? totalProductivityCurrent.totalEmployeeCost / headcountCurrent
        : 0;
    const employeeCostRatioCurrent =
      totalProductivityCurrent.totalCost > 0
        ? (totalProductivityCurrent.totalEmployeeCost /
            totalProductivityCurrent.totalCost) *
          100
        : 0;

    const totalProductivityPrevious = sumProductivity(previousYearProductivity);
    const headcountPrevious = previousYearHeadcount?.totalCount || 0;
    const costPerEmployeePrevious =
      headcountPrevious > 0
        ? totalProductivityPrevious.totalEmployeeCost / headcountPrevious
        : 0;
    const employeeCostRatioPrevious =
      totalProductivityPrevious.totalCost > 0
        ? (totalProductivityPrevious.totalEmployeeCost /
            totalProductivityPrevious.totalCost) *
          100
        : 0;

    const yoyTotalEmployeeCost = calculateYoY(
      totalProductivityCurrent.totalEmployeeCost,
      totalProductivityPrevious.totalEmployeeCost
    );
    const yoyCostPerEmployee = calculateYoY(
      costPerEmployeeCurrent,
      costPerEmployeePrevious
    );
    const yoyEmployeeCostRatio = calculateYoY(
      employeeCostRatioCurrent,
      employeeCostRatioPrevious
    );
    const yoyRevenue = calculateYoY(
      totalProductivityCurrent.revenue,
      totalProductivityPrevious.revenue
    );
    const yoyNetProfit = calculateYoY(
      totalProductivityCurrent.netProfit,
      totalProductivityPrevious.netProfit
    );
    const yoyRevenuePerEmployee = calculateYoY(
      headcountCurrent > 0
        ? totalProductivityCurrent.revenue / headcountCurrent
        : 0,
      headcountPrevious > 0
        ? totalProductivityPrevious.revenue / headcountPrevious
        : 0
    );
    const yoyNetProfitPerEmployee = calculateYoY(
      headcountCurrent > 0
        ? totalProductivityCurrent.netProfit / headcountCurrent
        : 0,
      headcountPrevious > 0
        ? totalProductivityPrevious.netProfit / headcountPrevious
        : 0
    );

    const response = {
      productivity: {
        revenue: {
          value: formatCurrency(totalProductivityCurrent.revenue),
          change: formatYoYString(yoyRevenue),
        },
        netProfit: {
          value: formatCurrency(totalProductivityCurrent.netProfit),
          change: formatYoYString(yoyNetProfit),
        },
        revenuePerEmployee: {
          value: formatCurrency(
            headcountCurrent > 0
              ? totalProductivityCurrent.revenue / headcountCurrent
              : 0
          ),
          change: formatYoYString(yoyRevenuePerEmployee),
        },
        netProfitPerEmployee: {
          value: formatCurrency(
            headcountCurrent > 0
              ? totalProductivityCurrent.netProfit / headcountCurrent
              : 0
          ),
          change: formatYoYString(yoyNetProfitPerEmployee),
        },
      },
      employeeCost: {
        total: {
          value: formatCurrency(totalProductivityCurrent.totalEmployeeCost),
          change: formatYoYString(yoyTotalEmployeeCost),
        },
        costPerEmployee: {
          value: formatCurrency(costPerEmployeeCurrent),
          change: formatYoYString(yoyCostPerEmployee),
        },
        ratio: {
          value: `${employeeCostRatioCurrent.toFixed(1)}%`,
          change: formatYoYString(yoyEmployeeCostRatio),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /productivity/metrics:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produktivitas." },
      { status: 500 }
    );
  }
}
