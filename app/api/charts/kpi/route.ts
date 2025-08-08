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
      where: {
        companyId,
        year,
        month: { in: monthsToFetch },
      },
      orderBy: { month: "asc" }, // biar urut bulan
    });

    if (kpiData.length === 0) {
      return NextResponse.json(
        { error: "Data KPI tidak ditemukan" },
        { status: 404 }
      );
    }

    // Kirim data KPI per bulan sesuai filter
    const response = kpiData.map((item) => ({
      month: item.month,
      kpiKorporasi: item.kpiKorporasi,
      kpiHcTransformation: item.kpiHcTransformation,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data KPI." },
      { status: 500 }
    );
  }
}
