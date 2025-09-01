// File: /api/charts/formation-rasio/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("id-ID", { month: "long" });
};

// Daftar 7 kategori sesuai urutan di form input
const CATEGORY_NAMES = [
  "Strategy",
  "Business",
  "Finance",
  "HC & GA",
  "Operation",
  "Compliance",
  "IT",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // Ambil data langsung dari tabel BARU dan juga data headcount
    const [formationRasioData, headcountData] = await Promise.all([
      prisma.formationRasioGroupedStat.findMany({
        where: { companyId, year },
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findMany({
        where: { companyId, year },
        orderBy: { month: "asc" },
      }),
    ]);

    const headcountMap = new Map<number, number>();
    headcountData.forEach((hc) => {
      headcountMap.set(hc.month, hc.totalCount);
    });

    // Proses data menjadi format yang dibutuhkan chart
    const processedData = formationRasioData.map((monthData) => {
      const { id, year, month, companyId, ...categories } = monthData;

      return {
        month: getMonthName(month),
        totalHeadcount: headcountMap.get(month) || 0,
        categories: {
          // Pastikan urutan kategori sesuai dengan keinginan
          Strategy: categories.strategy,
          Business: categories.business,
          Finance: categories.finance,
          "HC & GA": categories.hcGa,
          Operation: categories.operation,
          Compliance: categories.compliance,
          IT: categories.it,
        },
      };
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("API Error in /formation-rasio:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
