// File: app/api/demography/education/route.ts
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

    // Query ke DB tidak berubah, tetap ambil semua data
    const eduDataFromDb = await prisma.educationStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      select: {
        month: true,
        sdPermanent: true,
        sdContract: true,
        smpPermanent: true,
        smpContract: true,
        smaSmkPermanent: true,
        smaSmkContract: true,
        d3Permanent: true,
        d3Contract: true,
        s1Permanent: true,
        s1Contract: true,
        s2Permanent: true,
        s2Contract: true,
        s3Permanent: true,
        s3Contract: true,
      },
      orderBy: { month: "asc" },
    });

    const latestMonthInPeriod = Math.max(...monthsToFetch);
    const dataForPeriod = eduDataFromDb.find(
      (stat) => stat.month === latestMonthInPeriod
    );

    // ## PERUBAHAN 1: Hapus '< D3' dari labels ##
    const labels = ["SD", "SMP", "D3", "S1", "S2", "S3"];

    if (!dataForPeriod) {
      const emptyValues = [0, 0, 0, 0, 0, 0]; // Sesuaikan jumlah jadi 6
      return NextResponse.json({
        labels,
        permanent: { label: "Permanent", values: emptyValues },
        contract: { label: "Contract", values: emptyValues },
        total: { label: "Total", values: emptyValues },
      });
    }

    const sdPermanent = dataForPeriod.sdPermanent ?? 0;
    const sdContract = dataForPeriod.sdContract ?? 0;
    const smpPermanent = dataForPeriod.smpPermanent ?? 0;
    const smpContract = dataForPeriod.smpContract ?? 0;
    // Data smaSmk tetap diambil dari DB tapi tidak akan dipakai di response
    // const smaSmkPermanent = dataForPeriod.smaSmkPermanent ?? 0;
    // const smaSmkContract = dataForPeriod.smaSmkContract ?? 0;
    const d3Permanent = dataForPeriod.d3Permanent ?? 0;
    const d3Contract = dataForPeriod.d3Contract ?? 0;
    const s1Permanent = dataForPeriod.s1Permanent ?? 0;
    const s1Contract = dataForPeriod.s1Contract ?? 0;
    const s2Permanent = dataForPeriod.s2Permanent ?? 0;
    const s2Contract = dataForPeriod.s2Contract ?? 0;
    const s3Permanent = dataForPeriod.s3Permanent ?? 0;
    const s3Contract = dataForPeriod.s3Contract ?? 0;

    // ## PERUBAHAN 2: Hapus data smaSmk dari array values ##
    const permanentValues = [
      sdPermanent,
      smpPermanent,
      d3Permanent,
      s1Permanent,
      s2Permanent,
      s3Permanent,
    ];
    const contractValues = [
      sdContract,
      smpContract,
      d3Contract,
      s1Contract,
      s2Contract,
      s3Contract,
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
    console.error("API Error in /api/demography/education:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendidikan." },
      { status: 500 }
    );
  }
}
