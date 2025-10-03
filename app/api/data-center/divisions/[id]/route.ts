// File: app/api/data-center/divisions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PUT: Update actualCount (auto-save)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const { actualCount } = await request.json();

    const division = await prisma.divisionStat.findUnique({ where: { id } });
    if (
      !division ||
      (session.role !== "SUPER_ADMIN" &&
        division.companyId !== session.companyId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.divisionStat.update({
      where: { id },
      data: { actualCount },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Error in PUT /api/data-center/divisions/[id]:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus divisi dari bulan berjalan
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const division = await prisma.divisionStat.findUnique({ where: { id } });
    if (
      !division ||
      (session.role !== "SUPER_ADMIN" &&
        division.companyId !== session.companyId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.divisionStat.delete({ where: { id } });
    return NextResponse.json(
      { message: "Division deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/data-center/divisions/[id]:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: Mengambil data divisi, dengan logika "carry-over", PAGINASI, dan SEARCH
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
  const take = 15; // Jumlah data per halaman
  const skip = (page - 1) * take;

  const companyId =
    session.role === "SUPER_ADMIN"
      ? parseInt(searchParams.get("companyId") || "0")
      : session.companyId;

  if (!year || !month || !companyId) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  try {
    const initialCount = await prisma.divisionStat.count({
      where: { year, month, companyId },
    });

    // LOGIKA CARRY-OVER: Jika data bulan ini kosong & bukan Januari
    if (initialCount === 0 && month > 1) {
      const prevDivisions = await prisma.divisionStat.findMany({
        where: { year: year, month: month - 1, companyId },
      });

      if (prevDivisions.length > 0) {
        const newDivisionData = prevDivisions.map((d) => ({
          year,
          month,
          companyId,
          divisionName: d.divisionName,
          Kategori: d.Kategori,
          plannedCount: d.plannedCount,
          actualCount: 0, // Reset actual count
        }));
        await prisma.divisionStat.createMany({ data: newDivisionData });
      }
    }

    // Ambil data lagi setelah kemungkinan carry-over, sekarang dengan search dan paginasi
    const whereClause = {
      year,
      month,
      companyId,
      divisionName: {
        contains: search,
        mode: "insensitive" as const,
      },
    };

    const [divisions, total] = await prisma.$transaction([
      prisma.divisionStat.findMany({
        where: whereClause,
        orderBy: { divisionName: "asc" },
        take,
        skip,
      }),
      prisma.divisionStat.count({ where: whereClause }),
    ]);

    // Mengembalikan data dalam format objek { data, meta }
    return NextResponse.json({
      data: divisions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Failed to fetch/carry-over division data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Menambah satu divisi baru di bulan berjalan
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    year,
    month,
    companyId,
    divisionName,
    Kategori,
    plannedCount,
    actualCount,
  } = body;

  const targetCompanyId =
    session.role === "SUPER_ADMIN" ? companyId : session.companyId;

  if (!divisionName || !Kategori) {
    return NextResponse.json(
      { error: "Division Name and Category are required." },
      { status: 400 }
    );
  }

  try {
    const newDivision = await prisma.divisionStat.create({
      data: {
        year,
        month,
        companyId: targetCompanyId,
        divisionName,
        Kategori,
        plannedCount,
        actualCount,
      },
    });
    return NextResponse.json(newDivision, { status: 201 });
  } catch (error) {
    console.error("Failed to create division:", error);
    return NextResponse.json(
      { error: "Failed to create division" },
      { status: 500 }
    );
  }
}
