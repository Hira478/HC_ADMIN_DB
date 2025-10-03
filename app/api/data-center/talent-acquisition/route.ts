// File: app/api/data-center/talent-acquisition/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET handler: Mengambil data TalentAcquisitionStat.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");
  const companyId =
    session.role === "SUPER_ADMIN"
      ? parseInt(searchParams.get("companyId") || "0")
      : session.companyId;

  if (isNaN(year) || isNaN(month) || !companyId) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  try {
    const data = await prisma.talentAcquisitionStat.findUnique({
      where: { year_month_companyId: { year, month, companyId } },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch talent acquisition data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler: Membuat atau memperbarui (upsert) data.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { year, month, newHireCount, costOfHire, newHireRetention } = body;

  let targetCompanyId: number;
  if (session.role === "SUPER_ADMIN") {
    targetCompanyId = body.companyId;
  } else {
    targetCompanyId = session.companyId;
  }

  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };
  const dataToUpsert = {
    year,
    month,
    companyId: targetCompanyId,
    newHireCount,
    costOfHire,
    newHireRetention,
  };

  try {
    const result = await prisma.talentAcquisitionStat.upsert({
      where: whereClause,
      update: dataToUpsert,
      create: dataToUpsert,
    });

    return NextResponse.json(
      { message: "Talent acquisition data saved successfully.", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save talent acquisition data:", error);
    return NextResponse.json(
      { error: "Failed to save data." },
      { status: 500 }
    );
  }
}
