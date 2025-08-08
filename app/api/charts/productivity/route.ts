import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "quarterly")
    monthsToFetch =
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ][value - 1] || [];
  else if (type === "semesterly")
    monthsToFetch =
      [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ][value - 1] || [];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const productivityData = await prisma.productivityStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: { month: "asc" },
    });

    if (productivityData.length === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ubah data menjadi format yang dibutuhkan oleh Area Chart
    const response = {
      months: productivityData.map((d) => monthNames[d.month - 1]),
      revenue: productivityData.map((d) => d.revenue),
      netProfit: productivityData.map((d) => d.netProfit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /charts/productivity:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
