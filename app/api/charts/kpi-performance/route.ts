// File: app/api/charts/kpi-performance/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";
import { KpiStat } from "@prisma/client";

// Helper untuk menghitung rata-rata dari data bulanan
const calculateAverages = (records: KpiStat[]) => {
  if (records.length === 0) {
    return {
      finansial: 0,
      operasional: 0,
      sosial: 0,
      inovasiBisnis: 0,
      kepemimpinanTeknologi: 0,
      peningkatanInvestasi: 0,
      pengembanganTalenta: 0,
      totalScore: 0,
    };
  }
  const sum = records.reduce(
    (acc, rec) => {
      acc.finansial += rec.kpiFinansial;
      acc.operasional += rec.kpiOperasional;
      acc.sosial += rec.kpiSosial;
      acc.inovasiBisnis += rec.kpiInovasiBisnis;
      acc.kepemimpinanTeknologi += rec.kpiKepemimpinanTeknologi;
      acc.peningkatanInvestasi += rec.kpiPeningkatanInvestasi;
      acc.pengembanganTalenta += rec.kpiPengembanganTalenta;
      acc.totalScore += rec.totalScore;
      return acc;
    },
    {
      finansial: 0,
      operasional: 0,
      sosial: 0,
      inovasiBisnis: 0,
      kepemimpinanTeknologi: 0,
      peningkatanInvestasi: 0,
      pengembanganTalenta: 0,
      totalScore: 0,
    }
  );

  const count = records.length;
  return {
    finansial: sum.finansial / count,
    operasional: sum.operasional / count,
    sosial: sum.sosial / count,
    inovasiBisnis: sum.inovasiBisnis / count,
    kepemimpinanTeknologi: sum.kepemimpinanTeknologi / count,
    peningkatanInvestasi: sum.peningkatanInvestasi / count,
    pengembanganTalenta: sum.pengembanganTalenta / count,
    totalScore: sum.totalScore / count,
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "0");

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  try {
    const companyFilter = await getCompanyFilter();
    const currentYear = year;
    const previousYear = year - 1;

    const [currentYearRecords, previousYearRecords] = await Promise.all([
      prisma.kpiStat.findMany({
        where: { year: currentYear, ...companyFilter },
      }),
      prisma.kpiStat.findMany({
        where: { year: previousYear, ...companyFilter },
      }),
    ]);

    const currentYearAverages = calculateAverages(currentYearRecords);
    const previousYearAverages = calculateAverages(previousYearRecords);

    const categories = [
      "Finansial",
      "Operasional",
      "Sosial",
      "Inovasi Model Bisnis",
      "Kepemimpinan Teknologi",
      "Peningkatan Investasi",
      "Pengembangan Talenta",
    ];

    const responseData = {
      title: "KPI Performance Score",
      mainScore: currentYearAverages.totalScore,
      scoreLabel: "Average Score",
      trend: "-", // Anda bisa menambahkan logika tren di sini nanti
      chartData: {
        categories,
        seriesPrevYear: [
          previousYearAverages.finansial,
          previousYearAverages.operasional,
          previousYearAverages.sosial,
          previousYearAverages.inovasiBisnis,
          previousYearAverages.kepemimpinanTeknologi,
          previousYearAverages.peningkatanInvestasi,
          previousYearAverages.pengembanganTalenta,
        ],
        seriesCurrYear: [
          currentYearAverages.finansial,
          currentYearAverages.operasional,
          currentYearAverages.sosial,
          currentYearAverages.inovasiBisnis,
          currentYearAverages.kepemimpinanTeknologi,
          currentYearAverages.peningkatanInvestasi,
          currentYearAverages.pengembanganTalenta,
        ],
      },
      prevYear: previousYear,
      currYear: currentYear,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error in /kpi-performance:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data KPI." },
      { status: 500 }
    );
  }
}
