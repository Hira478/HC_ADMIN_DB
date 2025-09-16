// File: app/api/rkap/targets/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearStr = searchParams.get("year");
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  try {
    const companyFilter = await getCompanyFilter(request);

    // Ambil target RKAP untuk tahun yang dipilih
    // findFirst karena kita mengharapkan hanya ada 1 target per tahun per perusahaan
    const rkapTarget = await prisma.rkapTarget.findFirst({
      where: {
        year: year,
        ...companyFilter,
      },
    });

    // Jika tidak ada target, kembalikan nilai default 0
    if (!rkapTarget) {
      return NextResponse.json({
        revenue: 0,
        netProfit: 0,
        totalEmployeeCost: 0,
      });
    }

    return NextResponse.json(rkapTarget);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /rkap/targets:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data target RKAP." },
      { status: 500 }
    );
  }
}
