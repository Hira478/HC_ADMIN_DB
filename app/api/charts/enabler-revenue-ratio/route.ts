// File: app/api/charts/enabler-revenue-ratio/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get("year") || "0");
  const month = parseInt(searchParams.get("month") || "0");

  if (!year || !month) {
    return NextResponse.json(
      { error: "Parameter 'year' dan 'month' diperlukan." },
      { status: 400 }
    );
  }

  try {
    const companyFilter = await getCompanyFilter(request);

    // Ambil data formasi untuk bulan & tahun yang spesifik
    const formationData = await prisma.formationRasioGroupedStat.findFirst({
      where: { year, month, ...companyFilter },
    });

    // Jika tidak ada data, kembalikan nilai default 0
    if (!formationData) {
      return NextResponse.json({
        enabler: 0,
        revenueGenerator: 0,
      });
    }

    // Kalkulasi berdasarkan rumus baru
    const enablerCount =
      formationData.it +
      formationData.hcGa +
      formationData.finance +
      formationData.compliance;

    const revenueGeneratorCount =
      formationData.strategy + formationData.business + formationData.operation;

    return NextResponse.json({
      enabler: enablerCount,
      revenueGenerator: revenueGeneratorCount,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /enabler-revenue-ratio:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
