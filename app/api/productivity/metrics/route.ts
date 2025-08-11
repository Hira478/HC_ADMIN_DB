import { PrismaClient, ProductivityStat, Headcount } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const sumProductivity = (stats: ProductivityStat[]) =>
  stats.reduce(
    (acc, current) => {
      acc.revenue += current.revenue;
      acc.netProfit += current.netProfit;
      acc.totalEmployeeCost += current.totalEmployeeCost;
      return acc;
    },
    { revenue: 0, netProfit: 0, totalEmployeeCost: 0 }
  );

const sumHeadcount = (stats: Headcount[]) =>
  stats.reduce(
    (acc, current) => {
      acc.totalCount += current.totalCount;
      return acc;
    },
    { totalCount: 0 }
  );

// VERSI BARU FUNGSI FORMATTING
const formatCurrency = (value: number, isPerEmployee = false) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  // Untuk nilai per karyawan, gunakan 2 angka desimal
  if (isPerEmployee) {
    return `${sign}Rp ${absValue.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Untuk nilai total (revenue, profit, cost), tampilkan angka penuh tanpa desimal
  return `${sign}Rp ${absValue.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
  // Perubahan: Hilangkan 'type' karena sekarang hanya bulanan
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "6");

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  // Logika baru untuk mengambil bulan secara kumulatif
  const monthsToFetch: number[] = Array.from(
    { length: value },
    (_, i) => i + 1
  );

  try {
    const productivityData = await prisma.productivityStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    // Perubahan: Ambil headcount untuk bulan yang dipilih saja ('value')
    const headcountData = await prisma.headcount.findFirst({
      where: { companyId, year, month: value },
    });

    if (productivityData.length === 0 || !headcountData) {
      return NextResponse.json(
        { error: "Data tidak lengkap untuk periode ini." },
        { status: 404 }
      );
    }

    // Perubahan: Sum productivity data secara kumulatif
    const totalProductivity = sumProductivity(productivityData);

    // Gunakan headcount dari bulan yang dipilih
    const relevantHeadcount = headcountData.totalCount;

    // Perhitungan metrik per karyawan
    const revenuePerEmployee =
      relevantHeadcount > 0 ? totalProductivity.revenue / relevantHeadcount : 0;
    const netProfitPerEmployee =
      relevantHeadcount > 0
        ? totalProductivity.netProfit / relevantHeadcount
        : 0;
    const employeeCostRatio =
      relevantHeadcount > 0
        ? totalProductivity.totalEmployeeCost / relevantHeadcount
        : 0;

    const response = {
      productivity: {
        revenue: {
          value: formatCurrency(totalProductivity.revenue),
          unit: "(dalam Juta)",
        },
        netProfit: {
          value: formatCurrency(totalProductivity.netProfit),
          unit: "(dalam Juta)",
        },
        revenuePerEmployee: {
          value: formatCurrency(revenuePerEmployee, true),
          unit: "(Juta/Karyawan)",
        },
        netProfitPerEmployee: {
          value: formatCurrency(netProfitPerEmployee, true),
          unit: "(Juta/Karyawan)",
        },
      },
      employeeCost: {
        total: {
          value: formatCurrency(totalProductivity.totalEmployeeCost),
          unit: "(dalam Juta)",
        },
        ratio: {
          value: formatCurrency(employeeCostRatio, true),
          unit: "(Juta/Karyawan)",
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
