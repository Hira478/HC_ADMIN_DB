// File: app/api/productivity/metrics/route.ts

import { PrismaClient, ProductivityStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

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

  // Kembalikan format dengan "Rp " di depannya
  return `${sign}Rp ${formattedNumber}`;
};

const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) {
    return 0;
  }
  const denominator = Math.abs(previous);
  const percentageChange = ((current - previous) / denominator) * 100;
  return percentageChange;
};

const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const currentYear = parseInt(searchParams.get("year") || "2025");
  const monthValue = parseInt(searchParams.get("value") || "1");
  const previousYear = currentYear - 1;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  const monthsToFetch: number[] = Array.from(
    { length: monthValue },
    (_, i) => i + 1
  );

  try {
    const [
      currentYearProductivity,
      previousYearProductivity,
      currentYearHeadcount,
      previousYearHeadcount,
    ] = await Promise.all([
      prisma.productivityStat.findMany({
        where: { companyId, year: currentYear, month: { in: monthsToFetch } },
      }),
      prisma.productivityStat.findMany({
        where: { companyId, year: previousYear, month: { in: monthsToFetch } },
      }),
      prisma.headcount.findFirst({
        where: { companyId, year: currentYear, month: monthValue },
      }),
      prisma.headcount.findFirst({
        where: { companyId, year: previousYear, month: monthValue },
      }),
    ]);

    // --- Kalkulasi untuk TAHUN INI ---
    const totalProductivityCurrent = sumProductivity(currentYearProductivity);
    const headcountCurrent = currentYearHeadcount?.totalCount || 0;

    // 1. Ubah nama variabel untuk "Cost per Employee"
    const costPerEmployeeCurrent =
      headcountCurrent > 0
        ? totalProductivityCurrent.totalEmployeeCost / headcountCurrent
        : 0;

    // 2. Tambahkan perhitungan untuk "Employee Cost Rasio" yang baru
    const employeeCostRatioCurrent =
      totalProductivityCurrent.totalCost > 0
        ? (totalProductivityCurrent.totalEmployeeCost /
            totalProductivityCurrent.totalCost) *
          100
        : 0;

    // --- Kalkulasi untuk TAHUN SEBELUMNYA ---
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

    // --- Hitung YoY untuk semua metrik ---
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

    // (Perhitungan YoY untuk productivity tidak perlu diubah)
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
  } catch (error) {
    console.error("API Error in /productivity/metrics:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produktivitas." },
      { status: 500 }
    );
  }
}
