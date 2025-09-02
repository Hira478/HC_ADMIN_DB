// File: app/api/talent-acquisition/route.ts

import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleString("id-ID", { month: "short" });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const monthValue = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
      { status: 400 }
    );
  }

  try {
    const talentDataForYear = await prisma.talentAcquisitionStat.findMany({
      where: { companyId, year },
      orderBy: { month: "asc" },
    });

    // Jika tidak ada data sama sekali, KEMBALIKAN STRUKTUR LENGKAP DENGAN NILAI NOL
    if (talentDataForYear.length === 0) {
      return NextResponse.json({
        cards: { totalHire: 0, totalCostHire: 0, newHireRetention: 0 },
        charts: {
          newEmployee: { categories: [], data: [] },
          costOfHire: { categories: [], data: [] },
        },
      });
    }

    const selectedMonthData = talentDataForYear.find(
      (d) => d.month === monthValue
    );

    // Kalkulasi untuk Kartu
    const totalHire = selectedMonthData?.newHireCount ?? 0;
    const totalCostHire = selectedMonthData?.costOfHire ?? 0;
    const newHireRetention = selectedMonthData?.newHireRetention ?? 0;

    // Persiapan data untuk Chart
    const monthLabels = talentDataForYear.map((item) =>
      getMonthName(item.month)
    );
    const newEmployeeData = talentDataForYear.map((item) => item.newHireCount);
    const costOfHireData = talentDataForYear.map((item) => item.costOfHire);

    const response = {
      cards: { totalHire, totalCostHire, newHireRetention },
      charts: {
        newEmployee: { categories: monthLabels, data: newEmployeeData },
        costOfHire: { categories: monthLabels, data: costOfHireData },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error in /talent-acquisition:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
