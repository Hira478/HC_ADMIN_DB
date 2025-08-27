// app/api/input/formation-rasio/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year, month, ...scores } = body;

    // Konversi semua nilai skor ke integer
    Object.keys(scores).forEach((key) => {
      scores[key] = parseInt(scores[key], 10);
    });

    const result = await prisma.formationRasioStat.upsert({
      where: {
        year_month_companyId: {
          year: parseInt(year),
          month: parseInt(month),
          companyId: parseInt(companyId),
        },
      },
      update: scores,
      create: {
        year: parseInt(year),
        month: parseInt(month),
        companyId: parseInt(companyId),
        ...scores,
      },
    });
    return NextResponse.json({
      message: "Data Formation Rasio berhasil disimpan",
      data: result,
    });
  } catch (error) {
    console.error("Error saving Formation Rasio data:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
