// File: /api/charts/formation-rasio/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("id-ID", { month: "long" }); // Gunakan 'long' untuk nama bulan penuh
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    // 1. Ambil data mentah (10 kategori) dan data headcount untuk setahun
    const [formationRasioRaw, headcountData] = await Promise.all([
      prisma.formationRasioStat.findMany({
        where: { companyId, year },
        orderBy: { month: "asc" },
      }),
      prisma.headcount.findMany({
        where: { companyId, year },
        orderBy: { month: "asc" },
      }),
    ]);

    // Buat map headcount agar mudah dicari
    const headcountMap = new Map<number, number>();
    headcountData.forEach((hc) => {
      headcountMap.set(hc.month, hc.totalCount);
    });

    // 2. Proses dan kelompokkan data mentah menjadi 7 kategori
    const processedData = formationRasioRaw.map((monthData) => {
      const raw = monthData;

      // --- LOGIKA PENGELOMPOKAN DIMULAI DI SINI ---
      const groupedCategories = {
        "Strategy and R&D": raw.rd,
        Business: raw.business,
        Finance: raw.finance,
        "HC & GA":
          raw.humanResources + raw.corporateSecretary + raw.generalAffairs,
        Operation: raw.actuary,
        Compliance: raw.compliance + raw.legal,
        IT: raw.informationTechnology,
      };
      // --- LOGIKA PENGELOMPOKAN SELESAI ---

      return {
        month: getMonthName(raw.month),
        totalHeadcount: headcountMap.get(raw.month) || 0, // Ambil total headcount dari map
        categories: groupedCategories,
      };
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("API Error in /formation-rasio:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
