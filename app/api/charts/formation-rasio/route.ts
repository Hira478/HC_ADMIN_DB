import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- 1. Import helper keamanan

const jobFamilies = [
  { key: "strategy", name: "Strategy" },
  { key: "business", name: "Business" },
  { key: "finance", name: "Finance" },
  { key: "hcGa", name: "HC & GA" },
  { key: "operation", name: "Operation" },
  { key: "compliance", name: "Compliance" },
  { key: "it", name: "IT" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const month = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 4; // Tampilkan 4 item per halaman // Tampilkan 7 item (semua) per halaman, nonaktifkan paginasi

  try {
    // 2. Gunakan filter keamanan, bukan companyId dari URL
    const companyFilter = await getCompanyFilter(request);

    const [formationData, headcountData] = await Promise.all([
      prisma.formationRasioGroupedStat.findFirst({
        where: { year, month, ...companyFilter }, // <-- Terapkan filter
      }),
      prisma.headcount.findFirst({
        where: { year, month, ...companyFilter }, // <-- Terapkan filter
      }),
    ]);

    const marketBenchmark = {
      strategy: 5.0,
      business: 36.0,
      finance: 6.0,
      hcGa: 7.0,
      operation: 33.0,
      compliance: 5.0,
      it: 8.0,
    };

    // Penanganan jika data tidak ada, tetap kirim struktur tabel yang benar
    if (!formationData || !headcountData || headcountData.totalCount === 0) {
      const emptyData = jobFamilies.map((family) => ({
        jobFamily: family.name,
        rasio: "0.0%",
        market: `${marketBenchmark[
          family.key as keyof typeof marketBenchmark
        ].toFixed(1)}%`,
        rasioGap: -marketBenchmark[family.key as keyof typeof marketBenchmark],
      }));

      return NextResponse.json({
        data: emptyData,
        meta: { currentPage: 1, totalPages: 1 },
      });
    }

    const totalHeadcount = headcountData.totalCount;

    const allRows = jobFamilies.map((family) => {
      const companyHeadcount = (formationData as { [key: string]: number })[
        family.key
      ] as number;
      const companyRatio = (companyHeadcount / totalHeadcount) * 100;
      const marketRatio =
        marketBenchmark[family.key as keyof typeof marketBenchmark];

      // 3. Hapus kalkulasi 'statusRatio' yang lama
      // const statusRatio = ...

      // Logika 'rasioGap' Anda sudah benar
      const rasioGap = companyRatio - marketRatio;

      return {
        jobFamily: family.name,
        rasio: `${companyRatio.toFixed(1)}%`,
        market: `${marketRatio.toFixed(1)}%`,
        rasioGap: rasioGap,
      };
    });

    const totalPages = Math.ceil(allRows.length / pageSize);
    const paginatedData = allRows.slice((page - 1) * pageSize, page * pageSize);

    const response = {
      data: paginatedData,
      meta: {
        currentPage: page,
        totalPages: totalPages,
      },
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
