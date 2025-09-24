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

  try {
    const companyFilter = await getCompanyFilter(request);

    // 1. Hapus pengambilan data 'headcountData'
    // 2. Ubah `Promise.all` menjadi `await` tunggal karena hanya mengambil 1 data
    const formationData = await prisma.formationRasioGroupedStat.findFirst({
      where: { year, month, ...companyFilter },
    });

    const marketBenchmark = {
      it: 8.0,
      hcGa: 7.0,
      finance: 6.0,
      compliance: 5.0,
      strategy: 5.0,
      business: 36.0,
      operation: 33.0,
    };

    // 3. Ubah kondisi 'data tidak ada' menjadi hanya mengecek 'formationData'
    if (!formationData) {
      const emptyData = jobFamilies.map((family) => ({
        jobFamily: family.name,
        rasio: "0.0%",
        market: `${marketBenchmark[
          family.key as keyof typeof marketBenchmark
        ].toFixed(1)}%`,
        rasioGap: -marketBenchmark[family.key as keyof typeof marketBenchmark],
      }));
      return NextResponse.json({ data: emptyData, meta: null });
    }

    // 4. HITUNG TOTAL HEADCOUNT BARU dari jumlah 7 job family
    const totalHeadcountFromJobFamilies = jobFamilies.reduce((sum, family) => {
      // Ambil nilai dari formationData, jika tidak ada anggap 0
      const count =
        (formationData as { [key: string]: number })[family.key] ?? 0;
      return sum + count;
    }, 0);

    // Tambahkan pengecekan jika totalnya 0 untuk menghindari pembagian dengan nol
    if (totalHeadcountFromJobFamilies === 0) {
      const emptyData = jobFamilies.map((family) => ({
        jobFamily: family.name,
        rasio: "0.0%",
        market: `${marketBenchmark[
          family.key as keyof typeof marketBenchmark
        ].toFixed(1)}%`,
        rasioGap: -marketBenchmark[family.key as keyof typeof marketBenchmark],
      }));
      return NextResponse.json({ data: emptyData, meta: null });
    }

    const allRows = jobFamilies.map((family) => {
      const companyHeadcount = (formationData as { [key: string]: number })[
        family.key
      ] as number;
      // 5. Gunakan total headcount baru sebagai pembagi dalam kalkulasi rasio
      const companyRatio =
        (companyHeadcount / totalHeadcountFromJobFamilies) * 100;
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

    const response = {
      data: allRows,
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
