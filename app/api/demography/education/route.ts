// File: app/api/demography/education/route.ts
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

    const eduDataFromDb = await prisma.educationStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      select: {
        month: true,
        s3Permanent: true,
        s3Contract: true,
        s2Permanent: true,
        s2Contract: true,
        s1Permanent: true,
        s1Contract: true,
        d3Permanent: true,
        d3Contract: true,
        smaSmkPermanent: true,
        smaSmkContract: true,
      },
      orderBy: { month: "asc" },
    });

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = eduDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    const labels = ["S3", "S2", "S1", "D3", "< D3"];

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0, 0];
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    const s3Permanent = dataForPeriod.s3Permanent ?? 0;
    const s3Contract = dataForPeriod.s3Contract ?? 0;
    const s2Permanent = dataForPeriod.s2Permanent ?? 0;
    const s2Contract = dataForPeriod.s2Contract ?? 0;
    const s1Permanent = dataForPeriod.s1Permanent ?? 0;
    const s1Contract = dataForPeriod.s1Contract ?? 0;
    const d3Permanent = dataForPeriod.d3Permanent ?? 0;
    const d3Contract = dataForPeriod.d3Contract ?? 0;
    const smaSmkPermanent = dataForPeriod.smaSmkPermanent ?? 0;
    const smaSmkContract = dataForPeriod.smaSmkContract ?? 0;

    const permanentValues = [
      s3Permanent,
      s2Permanent,
      s1Permanent,
      d3Permanent,
      smaSmkPermanent,
    ];
    const contractValues = [
      s3Contract,
      s2Contract,
      s1Contract,
      d3Contract,
      smaSmkContract,
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
  } catch (error) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /api/demography/education:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendidikan." },
      { status: 500 }
    );
  }
}
