// File: app/api/data-center/divisions/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET handler: Mengambil data divisi dengan paginasi dan pencarian.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const take = 15; // Tampilkan 15 divisi per halaman
  const skip = (page - 1) * take;

  // SUPER_ADMIN bisa memfilter company, yang lain tidak.
  const companyId =
    session.role === "SUPER_ADMIN"
      ? parseInt(searchParams.get("companyId") || "0")
      : session.companyId;

  if (isNaN(year) || isNaN(month) || !companyId) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const whereClause = {
    companyId,
    year,
    month,
    divisionName: {
      contains: search,
      mode: "insensitive" as const,
    },
  };

  try {
    const [divisions, total] = await prisma.$transaction([
      prisma.divisionStat.findMany({
        where: whereClause,
        orderBy: { divisionName: "asc" },
        take,
        skip,
      }),
      prisma.divisionStat.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: divisions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Failed to fetch division data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler: Memperbarui 'actualCount' untuk satu divisi.
 */
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, actualCount } = await request.json();

  if (typeof id !== "number" || typeof actualCount !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // Verifikasi bahwa user hanya mengedit data perusahaannya sendiri
    const division = await prisma.divisionStat.findUnique({ where: { id } });
    if (
      !division ||
      (session.role !== "SUPER_ADMIN" &&
        division.companyId !== session.companyId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedDivision = await prisma.divisionStat.update({
      where: { id },
      data: { actualCount },
    });

    return NextResponse.json(updatedDivision);
  } catch (error) {
    console.error("Failed to update division stat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
