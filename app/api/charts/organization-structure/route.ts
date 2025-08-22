// app/api/charts/organization-structure/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");

  if (!companyId || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const companyIdNum = parseInt(companyId);
  const yearNum = parseInt(year);

  try {
    const record = await prisma.organizationStructureStat.findUnique({
      where: { year_companyId: { year: yearNum, companyId: companyIdNum } },
    });

    if (!record) {
      // Return empty/default structure if no data found
      return NextResponse.json({
        formationRatioChart: { categories: [], data: [] },
        formationRatioCard: { enabler: 0, revenueGenerator: 0 },
        designOrgCard: { division: 0, department: 0 },
        avgSpanCard: { department: 0, employee: 0 },
      });
    }

    const responseData = {
      formationRatioChart: {
        categories: [
          "Risiko &\nTata Kelola",
          "SDM &\nUmum",
          "Keuangan",
          "IT",
          "Operasional",
          "Bisnis",
          "Cabang",
        ],
        data: [
          record.risikoTataKelola,
          record.sdmUmum,
          record.keuangan,
          record.it,
          record.operasional,
          record.bisnis,
          record.cabang,
        ],
      },
      formationRatioCard: {
        enabler: record.enablerCount,
        revenueGenerator: record.revenueGeneratorCount,
      },
      designOrgCard: {
        division: record.divisionCount,
        department: record.departmentCount,
      },
      avgSpanCard: {
        department: record.avgSpanDepartment,
        employee: record.avgSpanEmployee,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch organization structure data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
