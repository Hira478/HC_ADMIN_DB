// app/api/input/culture-maturity/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year, ...scores } = body;

    // Konversi semua nilai skor ke float
    Object.keys(scores).forEach((key) => {
      scores[key] = parseFloat(scores[key]);
    });

    const result = await prisma.cultureMaturityStat.upsert({
      where: {
        year_companyId: {
          year: parseInt(year),
          companyId: parseInt(companyId),
        },
      },
      update: scores,
      create: {
        year: parseInt(year),
        companyId: parseInt(companyId),
        ...scores,
      },
    });
    return NextResponse.json({
      message: "Data Culture Maturity berhasil disimpan",
      data: result,
    });
  } catch (error) {
    console.error("Error saving Culture Maturity score:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
