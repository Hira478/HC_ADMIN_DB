// File: /api/charts/formation-rasio/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const jobFamilies = [
  { key: "strategy", name: "Strategy" },
  { key: "business", name: "Business" },
  { key: "finance", name: "Finance" },
  { key: "hcGa", name: "HC & GA" },
  { key: "operation", name: "Operation" },
  { key: "compliance", name: "Compliance" },
  { key: "it", name: "IT" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  // Ambil filter bulan dari frontend
  const month = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 4; // Tampilkan 4 item per halaman

  if (!companyId || !year || !month) {
    return NextResponse.json(
      { error: "Parameter tidak lengkap." },
      { status: 400 }
    );
  }

  try {
    // 1. Ambil data yang relevan untuk bulan terpilih
    const [formationData, headcountData] = await Promise.all([
      prisma.formationRasioGroupedStat.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
      prisma.headcount.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
    ]);

    // Data benchmark pasar (hardcoded sesuai permintaan)
    const marketBenchmark = {
      strategy: 5.0,
      business: 25.0,
      finance: 12.0,
      hcGa: 15.0,
      operation: 10.0,
      compliance: 8.0,
      it: 25.0,
    };

    // Jika data utama tidak ada, kembalikan data kosong
    if (!formationData || !headcountData) {
      return NextResponse.json({
        data: [],
        meta: { currentPage: 1, totalPages: 0 },
      });
    }

    const totalHeadcount = headcountData.totalCount;

    // 2. Kalkulasi semua baris data
    const allRows = jobFamilies.map((family) => {
      const companyHeadcount = formationData[
        family.key as keyof typeof formationData
      ] as number;
      const companyRatio =
        totalHeadcount > 0 ? (companyHeadcount / totalHeadcount) * 100 : 0;
      const marketRatio = marketBenchmark[
        family.key as keyof typeof marketBenchmark
      ] as number;
      const statusRatio =
        marketRatio > 0 ? (companyRatio / marketRatio) * 100 : 0;

      return {
        jobFamily: family.name,
        rasio: `${companyRatio.toFixed(1)}%`,
        market: `${marketRatio.toFixed(1)}%`,
        statusRatio: statusRatio,
      };
    });

    // 3. Terapkan paginasi
    const totalItems = allRows.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = allRows.slice((page - 1) * pageSize, page * pageSize);

    const response = {
      data: paginatedData,
      meta: {
        currentPage: page,
        totalPages: totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /formation-rasio:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
