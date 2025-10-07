import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
  const take = 15;
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

    // LOGIKA CARRY-OVER (tidak berubah)
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
          actualCount: 0,
        }));
        await prisma.divisionStat.createMany({ data: newDivisionData });
      }
    }

    const whereClauseForSearch = {
      year,
      month,
      companyId,
      divisionName: {
        contains: search,
        mode: "insensitive" as const,
      },
    };

    // --- DIUBAH: Tambahkan agregasi untuk menjumlahkan actualCount ---
    const [divisions, total, totalHeadcountResult] = await prisma.$transaction([
      prisma.divisionStat.findMany({
        where: whereClauseForSearch,
        orderBy: { divisionName: "asc" },
        take,
        skip,
      }),
      prisma.divisionStat.count({ where: whereClauseForSearch }),
      // Query baru untuk menjumlahkan semua 'actualCount' pada periode ini (tanpa filter search)
      prisma.divisionStat.aggregate({
        _sum: { actualCount: true },
        where: { year, month, companyId },
      }),
    ]);

    const totalActualHeadcount = totalHeadcountResult._sum.actualCount || 0;

    // --- DIUBAH: Kirim totalActualHeadcount di dalam 'meta' ---
    return NextResponse.json({
      data: divisions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / take),
        totalActualHeadcount, // Kirim data total headcount ke frontend
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
        // Kategori diisi default oleh Prisma, jadi tidak perlu disertakan di sini
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
