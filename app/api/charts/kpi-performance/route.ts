// File: app/api/charts/kpi-performance/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 1. SEKARANG KITA BUTUH PARAMETER 'month' DARI FRONTEND
  const year = parseInt(searchParams.get("year") || "0");
  const month = parseInt(searchParams.get("month") || "0");

  if (!year || !month) {
    return NextResponse.json(
      { error: "Parameter 'year' dan 'month' diperlukan." },
      { status: 400 }
    );
  }

  try {
    const companyFilter = await getCompanyFilter();
    const currentYear = year;
    const previousYear = year - 1;

    // 2. QUERY DIUBAH DARI findMany MENJADI findFirst UNTUK SATU BULAN
    const [currentMonthRecord, previousYearMonthRecord] = await Promise.all([
      prisma.kpiStat.findFirst({
        where: { year: currentYear, month: month, ...companyFilter },
      }),
      prisma.kpiStat.findFirst({
        where: { year: previousYear, month: month, ...companyFilter },
      }),
    ]);

    const categories = [
      "Finansial",
      "Operasional",
      "Sosial",
      "Inovasi Model Bisnis",
      "Kepemimpinan Teknologi",
      "Peningkatan Investasi",
      "Pengembangan Talenta",
    ];

    // 3. DATA LANGSUNG DIAMBIL DARI RECORD, TANPA RATA-RATA
    // Gunakan 'nullish coalescing' (?? 0) untuk default jika data tidak ada
    const responseData = {
      title: "KPI Performance Score",
      mainScore: currentMonthRecord?.totalScore ?? 0,
      scoreLabel: "Total Score",
      trend: "-",
      chartData: {
        categories,
        seriesPrevYear: [
          previousYearMonthRecord?.kpiFinansial ?? 0,
          previousYearMonthRecord?.kpiOperasional ?? 0,
          previousYearMonthRecord?.kpiSosial ?? 0,
          previousYearMonthRecord?.kpiInovasiBisnis ?? 0,
          previousYearMonthRecord?.kpiKepemimpinanTeknologi ?? 0,
          previousYearMonthRecord?.kpiPeningkatanInvestasi ?? 0,
          previousYearMonthRecord?.kpiPengembanganTalenta ?? 0,
        ],
        seriesCurrYear: [
          currentMonthRecord?.kpiFinansial ?? 0,
          currentMonthRecord?.kpiOperasional ?? 0,
          currentMonthRecord?.kpiSosial ?? 0,
          currentMonthRecord?.kpiInovasiBisnis ?? 0,
          currentMonthRecord?.kpiKepemimpinanTeknologi ?? 0,
          currentMonthRecord?.kpiPeningkatanInvestasi ?? 0,
          currentMonthRecord?.kpiPengembanganTalenta ?? 0,
        ],
      },
      prevYear: previousYear,
      currYear: currentYear,
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /kpi-performance:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data KPI." },
      { status: 500 }
    );
  }
}
