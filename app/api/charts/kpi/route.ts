// pages/api/kpi/stats.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8"); // Menggunakan 'value' untuk bulan

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    const kpiData = await prisma.kpiStat.findMany({
      where: {
        companyId,
        year,
        month: value, // Filter KPI berdasarkan bulan yang dipilih
      },
    });

    if (kpiData.length === 0) {
      return NextResponse.json(
        { error: "Data KPI tidak ditemukan untuk bulan ini." },
        { status: 404 }
      );
    }

    // Kirim data KPI untuk bulan yang dipilih
    const response = kpiData.map((item) => ({
      month: item.month,
      kpiKorporasi: item.kpiKorporasi,
      kpiHcTransformation: item.kpiHcTransformation,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Gagal mengambil data KPI:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data KPI." },
      { status: 500 }
    );
  }
}
