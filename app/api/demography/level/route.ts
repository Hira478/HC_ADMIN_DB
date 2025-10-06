// File: app/api/demography/level/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );
  // ## 1. BACA FILTER STATUS DARI URL ##
  const status = searchParams.get("status") || "all";

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const companyFilter = await getCompanyFilter(request);

    const levelDataFromDb = await prisma.levelStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      select: {
        month: true,
        bod1Permanent: true,
        bod1Contract: true,
        bod2Permanent: true,
        bod2Contract: true,
        bod3Permanent: true,
        bod3Contract: true,
        bod4Permanent: true,
        bod4Contract: true,
      },
      orderBy: { month: "asc" },
    });

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = levelDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    const labels = ["BOD-1", "BOD-2", "BOD-3", "BOD-4"];

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0];
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    const bod1Permanent = dataForPeriod.bod1Permanent ?? 0;
    const bod1Contract = dataForPeriod.bod1Contract ?? 0;
    const bod2Permanent = dataForPeriod.bod2Permanent ?? 0;
    const bod2Contract = dataForPeriod.bod2Contract ?? 0;
    const bod3Permanent = dataForPeriod.bod3Permanent ?? 0;
    const bod3Contract = dataForPeriod.bod3Contract ?? 0;
    const bod4Permanent = dataForPeriod.bod4Permanent ?? 0;
    const bod4Contract = dataForPeriod.bod4Contract ?? 0;

    const permanentValues = [
      bod1Permanent,
      bod2Permanent,
      bod3Permanent,
      bod4Permanent,
    ];
    const contractValues = [
      bod1Contract,
      bod2Contract,
      bod3Contract,
      bod4Contract,
    ];

    // ## 2. TENTUKAN NILAI 'TOTAL' BERDASARKAN FILTER STATUS ##
    let totalValues: number[];

    switch (status) {
      case "permanent":
        totalValues = permanentValues;
        break;
      case "contract":
        totalValues = contractValues;
        break;
      default: // 'all'
        totalValues = permanentValues.map((val, i) => val + contractValues[i]);
        break;
    }

    return NextResponse.json({
      labels,
      permanent: { label: "Permanent", values: permanentValues },
      contract: { label: "Contract", values: contractValues },
      total: { label: "Total", values: totalValues },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /api/demography/level:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data level jabatan." },
      { status: 500 }
    );
  }
}
