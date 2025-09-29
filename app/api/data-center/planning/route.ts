// File: app/api/data-center/planning/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET handler for planning data.
 * Fetches ManpowerPlanning and FormationRasioGroupedStat.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");
  const companyId = parseInt(searchParams.get("companyId") || "");

  if (isNaN(year) || isNaN(month) || isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  // Authorization: non-superadmins can only view their own company data
  if (session.role !== "SUPER_ADMIN" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [manpowerPlanning, formationRasio] = await prisma.$transaction([
      prisma.manpowerPlanning.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
      prisma.formationRasioGroupedStat.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
    ]);

    return NextResponse.json({ manpowerPlanning, formationRasio });
  } catch (error) {
    console.error("Failed to fetch planning data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create or update (upsert) planning data.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Data Isolation Logic
  let targetCompanyId: number;
  if (session.role === "SUPER_ADMIN") {
    targetCompanyId = body.companyId;
  } else {
    targetCompanyId = session.companyId;
  }

  const { year, month, manpowerPlanning, formationRasio } = body;
  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };

  try {
    await prisma.$transaction([
      prisma.manpowerPlanning.upsert({
        where: whereClause,
        update: { ...manpowerPlanning },
        create: {
          year,
          month,
          companyId: targetCompanyId,
          ...manpowerPlanning,
        },
      }),
      prisma.formationRasioGroupedStat.upsert({
        where: whereClause,
        update: { ...formationRasio },
        create: { year, month, companyId: targetCompanyId, ...formationRasio },
      }),
    ]);

    return NextResponse.json(
      { message: "Planning data saved successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save planning data:", error);
    return NextResponse.json(
      { error: "Failed to save data." },
      { status: 500 }
    );
  }
}
