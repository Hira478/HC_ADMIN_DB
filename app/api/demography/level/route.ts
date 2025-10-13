// File: app/api/demography/level/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const companyFilter = await getCompanyFilter(request);

    // ## 1. UBAH SELECT: Ambil juga data BOD-5 ##
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
        bod5Permanent: true, // <-- Ambil data BOD-5
        bod5Contract: true, // <-- Ambil data BOD-5
      },
      orderBy: { month: "asc" },
    });

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = levelDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    // ## 2. UBAH LABELS: Jadi 5 kategori ##
    const labels = ["BOD-1", "BOD-2", "BOD-3", "BOD-4", "BOD-4 >"];

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0, 0]; // Sesuaikan jadi 5
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    // ## 3. AMBIL DATA BOD-5 DARI HASIL QUERY ##
    const bod1Permanent = dataForPeriod.bod1Permanent ?? 0;
    const bod1Contract = dataForPeriod.bod1Contract ?? 0;
    const bod2Permanent = dataForPeriod.bod2Permanent ?? 0;
    const bod2Contract = dataForPeriod.bod2Contract ?? 0;
    const bod3Permanent = dataForPeriod.bod3Permanent ?? 0;
    const bod3Contract = dataForPeriod.bod3Contract ?? 0;
    const bod4Permanent = dataForPeriod.bod4Permanent ?? 0;
    const bod4Contract = dataForPeriod.bod4Contract ?? 0;
    const bod5Permanent = dataForPeriod.bod5Permanent ?? 0; // <-- Ambil data BOD-5
    const bod5Contract = dataForPeriod.bod5Contract ?? 0; // <-- Ambil data BOD-5

    // ## 4. SUSUN ARRAY VALUES MENJADI 5 ELEMEN ##
    const permanentValues = [
      bod1Permanent,
      bod2Permanent,
      bod3Permanent,
      bod4Permanent,
      bod5Permanent, // <-- Data BOD-5 akan ditampilkan sebagai "BOD-4 >"
    ];
    const contractValues = [
      bod1Contract,
      bod2Contract,
      bod3Contract,
      bod4Contract,
      bod5Contract, // <-- Data BOD-5 akan ditampilkan sebagai "BOD-4 >"
    ];

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
