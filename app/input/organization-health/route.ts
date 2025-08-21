// app/api/input/organization-health/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year, ...scores } = body;

    Object.keys(scores).forEach((key) => {
      scores[key] = parseFloat(scores[key]);
    });

    const result = await prisma.organizationHealthStat.upsert({
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
      message: "Data Organization Health berhasil disimpan",
      data: result,
    });
  } catch (error) {
    console.error("Error saving Org Health score:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
