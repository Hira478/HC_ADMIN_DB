// File: app/api/demography/service-length/route.ts
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
  const status = searchParams.get("status") || "all";

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);

  try {
    const companyFilter = await getCompanyFilter(request);

    // ## 1. UBAH SELECT UNTUK MENGAMBIL KOLOM BARU ##
    const losDataFromDb = await prisma.lengthOfServiceStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      select: {
        month: true,
        los_under_5_Permanent: true,
        los_under_5_Contract: true,
        los_5_to_10_Permanent: true,
        los_5_to_10_Contract: true,
        los_11_to_15_Permanent: true,
        los_11_to_15_Contract: true,
        los_16_to_20_Permanent: true,
        los_16_to_20_Contract: true,
        los_over_25_Permanent: true,
        los_over_25_Contract: true,
      },
      orderBy: { month: "asc" },
    });

    // ## 2. PERBARUI LABELS SESUAI 5 KATEGORI BARU ##
    const labels = [
      "< 5 Years",
      "5 - 10 Years",
      "11 - 15 Years",
      "16 - 20 Years",
      "> 25 Years",
    ];

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = losDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0, 0]; // Sesuaikan jumlah jadi 5
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    // ## 3. SUSUN ULANG DATA VALUES SESUAI SKEMA & LABEL BARU ##
    const permanentValues = [
      dataForPeriod.los_under_5_Permanent ?? 0,
      dataForPeriod.los_5_to_10_Permanent ?? 0,
      dataForPeriod.los_11_to_15_Permanent ?? 0,
      dataForPeriod.los_16_to_20_Permanent ?? 0,
      dataForPeriod.los_over_25_Permanent ?? 0,
    ];
    const contractValues = [
      dataForPeriod.los_under_5_Contract ?? 0,
      dataForPeriod.los_5_to_10_Contract ?? 0,
      dataForPeriod.los_11_to_15_Contract ?? 0,
      dataForPeriod.los_16_to_20_Contract ?? 0,
      dataForPeriod.los_over_25_Contract ?? 0,
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
  } catch (error) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /api/demography/service-length:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lama bekerja." },
      { status: 500 }
    );
  }
}
