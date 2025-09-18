// File: app/api/charts/org-summary/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get("year") || "0");

  if (!year) {
    return NextResponse.json(
      { error: "Parameter 'year' diperlukan." },
      { status: 400 }
    );
  }

  try {
    const companyFilter = await getCompanyFilter(request);

    const record = await prisma.organizationStructureStat.findFirst({
      where: {
        year: year,
        ...companyFilter,
      },
      select: {
        divisionCount: true,
        departmentCount: true,
      },
    });

    // Jika tidak ada data, kembalikan nilai default 0
    if (!record) {
      return NextResponse.json({
        divisionCount: 0,
        departmentCount: 0,
      });
    }

    return NextResponse.json(record);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /org-summary:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ringkasan organisasi." },
      { status: 500 }
    );
  }
}
