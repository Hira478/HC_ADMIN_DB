import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  let monthsToFetch: number[] = [];
  if (type === "monthly") {
    monthsToFetch = [value];
  } else if (type === "quarterly") {
    monthsToFetch =
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ][value - 1] || [];
  } else if (type === "semesterly") {
    monthsToFetch =
      [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ][value - 1] || [];
  } else if (type === "yearly") {
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  try {
    const kpiData = await prisma.kpiStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
    });

    if (kpiData.length === 0) {
      return NextResponse.json(
        { error: "Data KPI tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung rata-rata
    const totalKorporasi = kpiData.reduce(
      (sum, item) => sum + item.kpiKorporasi,
      0
    );
    const totalHc = kpiData.reduce(
      (sum, item) => sum + item.kpiHcTransformation,
      0
    );

    const response = {
      kpiKorporasi: totalKorporasi / kpiData.length,
      kpiHcTransformation: totalHc / kpiData.length,
    };

    return NextResponse.json(response);
  } catch (_error) {
    // Changed 'error' to '_error' to indicate it's unused
    // You might want to log the actual error here for debugging purposes in the future
    // console.error(_error);
    return NextResponse.json(
      { error: "Gagal mengambil data KPI." },
      { status: 500 }
    );
  }
}
