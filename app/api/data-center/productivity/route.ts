// File: app/api/data-center/productivity/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * Handler untuk GET request.
 * Mengambil data ProductivityStat dan EmployeeCostStat.
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

  // Otorisasi: User non-superadmin hanya bisa melihat data perusahaannya sendiri
  if (session.role !== "SUPER_ADMIN" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [productivity, employeeCost] = await prisma.$transaction([
      prisma.productivityStat.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
      prisma.employeeCostStat.findUnique({
        where: { year_month_companyId: { year, month, companyId } },
      }),
    ]);

    return NextResponse.json({ productivity, employeeCost });
  } catch (error) {
    console.error("Failed to fetch productivity data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handler untuk POST request.
 * Membuat atau mengupdate (upsert) data.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Logika Isolasi Data
  let targetCompanyId: number;
  if (session.role === "SUPER_ADMIN") {
    targetCompanyId = body.companyId;
  } else {
    targetCompanyId = session.companyId;
  }

  const { year, month, productivity, employeeCost } = body;
  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };

  try {
    await prisma.$transaction([
      prisma.productivityStat.upsert({
        where: whereClause,
        update: { ...productivity },
        create: { year, month, companyId: targetCompanyId, ...productivity },
      }),
      prisma.employeeCostStat.upsert({
        where: whereClause,
        update: { ...employeeCost },
        create: { year, month, companyId: targetCompanyId, ...employeeCost },
      }),
    ]);

    return NextResponse.json(
      { message: "The productivity data has been successfully saved." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save productivity data:", error);
    return NextResponse.json(
      { error: "Failed to save data." },
      { status: 500 }
    );
  }
}
