// File: /api/charts/formation-rasio/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

const jobFamilies = [
  // Urutan ini akan menjadi urutan di chart
  { key: "it", name: "IT" },
  { key: "hcGa", name: "HC & GA" },
  { key: "finance", name: "Finance" },
  { key: "compliance", name: "Compliance" },
  { key: "strategy", name: "Strategy" },
  { key: "business", name: "Business" },
  { key: "operation", name: "Operation" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const month = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );
  // Hapus 'page', kita tidak memerlukannya lagi
  // const page = parseInt(searchParams.get("page") || "1");

  try {
    const companyFilter = await getCompanyFilter(request);

    const [formationData, headcountData] = await Promise.all([
      prisma.formationRasioGroupedStat.findFirst({
        where: { year, month, ...companyFilter },
      }),
      prisma.headcount.findFirst({
        where: { year, month, ...companyFilter },
      }),
    ]);

    const marketBenchmark = {
      it: 8.0,
      hcGa: 7.0,
      finance: 6.0,
      compliance: 5.0,
      strategy: 5.0,
      business: 36.0,
      operation: 33.0,
    };

    if (!formationData || !headcountData || headcountData.totalCount === 0) {
      const emptyData = jobFamilies.map((family) => ({
        jobFamily: family.name,
        rasio: "0.0%",
        market: `${marketBenchmark[
          family.key as keyof typeof marketBenchmark
        ].toFixed(1)}%`,
        rasioGap: -marketBenchmark[family.key as keyof typeof marketBenchmark],
      }));

      // Kirim data kosong tanpa meta paginasi
      return NextResponse.json({ data: emptyData, meta: null });
    }

    const totalHeadcount = headcountData.totalCount;

    const allRows = jobFamilies.map((family) => {
      const companyHeadcount = (formationData as { [key: string]: number })[
        family.key
      ] as number;
      const companyRatio = (companyHeadcount / totalHeadcount) * 100;
      const marketRatio =
        marketBenchmark[family.key as keyof typeof marketBenchmark];
      const rasioGap = companyRatio - marketRatio;

      return {
        jobFamily: family.name,
        rasio: `${companyRatio.toFixed(1)}%`,
        market: `${marketRatio.toFixed(1)}%`,
        rasioGap: rasioGap,
      };
    });

    // UBAH: Kirim semua data, bukan data per halaman
    const response = {
      data: allRows,
      // Hapus meta paginasi, atau set ke null
      meta: null,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /formation-rasio:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
