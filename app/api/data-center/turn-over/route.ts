// File: app/api/data-center/turn-over/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET handler: Fetches TurnOverStat data.
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
    const data = await prisma.turnoverStat.findUnique({
      where: { year_month_companyId: { year, month, companyId } },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch turn over data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler: Creates or updates (upsert) turn over data.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { year, month, resignCount } = body;

  let targetCompanyId: number;
  if (session.role === "SUPER_ADMIN") {
    targetCompanyId = body.companyId;
  } else {
    targetCompanyId = session.companyId;
  }

  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };
  const dataToUpsert = { year, month, companyId: targetCompanyId, resignCount };

  try {
    const result = await prisma.turnoverStat.upsert({
      where: whereClause,
      update: dataToUpsert,
      create: dataToUpsert,
    });

    return NextResponse.json(
      { message: "Turn over data saved successfully.", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save turn over data:", error);
    return NextResponse.json(
      { error: "Failed to save data." },
      { status: 500 }
    );
  }
}
