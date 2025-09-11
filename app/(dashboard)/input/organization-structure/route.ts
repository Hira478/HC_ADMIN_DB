// app/api/input/organization-structure/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year, ...scores } = body;

    // Konversi semua nilai ke tipe data yang benar (Float/Int)
    Object.keys(scores).forEach((key) => {
      // Fields untuk chart bisa jadi float, sisanya integer
      const floatFields = [
        "risikoTataKelola",
        "sdmUmum",
        "keuangan",
        "it",
        "operasional",
        "bisnis",
        "cabang",
      ];
      if (floatFields.includes(key)) {
        scores[key] = parseFloat(scores[key]);
      } else {
        scores[key] = parseInt(scores[key]);
      }
    });

    const result = await prisma.organizationStructureStat.upsert({
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
      message: "Data Struktur Organisasi berhasil disimpan",
      data: result,
    });
  } catch (error) {
    console.error("Error saving Org Structure score:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
