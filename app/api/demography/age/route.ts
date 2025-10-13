// File: app/api/demography/age/route.ts
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

    const ageDataFromDb = await prisma.ageStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      select: {
        month: true,
        under25Permanent: true,
        under25Contract: true,
        age26to40Permanent: true,
        age26to40Contract: true,
        age41to50Permanent: true,
        age41to50Contract: true,
        age51to60Permanent: true, // <-- Kolom baru
        age51to60Contract: true, // <-- Kolom baru
        over60Permanent: true, // <-- Kolom baru
        over60Contract: true,
      },
      orderBy: { month: "asc" },
    });

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = ageDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    const labels = [">60", "51-60", "41-50", "26-40", "<25"];

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0, 0];
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    const over60Permanent = dataForPeriod.over60Permanent ?? 0;
    const over60Contract = dataForPeriod.over60Contract ?? 0;
    const age51to60Permanent = dataForPeriod.age51to60Permanent ?? 0;
    const age51to60Contract = dataForPeriod.age51to60Contract ?? 0;
    const age41to50Permanent = dataForPeriod.age41to50Permanent ?? 0;
    const age41to50Contract = dataForPeriod.age41to50Contract ?? 0;
    const age26to40Permanent = dataForPeriod.age26to40Permanent ?? 0;
    const age26to40Contract = dataForPeriod.age26to40Contract ?? 0;
    const under25Permanent = dataForPeriod.under25Permanent ?? 0;
    const under25Contract = dataForPeriod.under25Contract ?? 0;

    // ## PERUBAHAN 2: Susun array values sesuai urutan label baru ##
    // Urutan: 51-60, 41-50, 31-40, <=30
    const permanentValues = [
      over60Permanent,
      age51to60Permanent,
      age41to50Permanent,
      age26to40Permanent,
      under25Permanent,
    ];
    const contractValues = [
      over60Contract,
      age51to60Contract,
      age41to50Contract,
      age26to40Contract,
      under25Contract,
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
    console.error("API Error in /api/demography/age:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data usia." },
      { status: 500 }
    );
  }
}
