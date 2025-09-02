// app/api/input/organization-structure/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year } = body;

    // 1. Buat objek payload yang terdefinisi dengan jelas untuk semua skor
    // Mengonversi setiap nilai ke tipe data yang benar (Float/Int)
    const scoresPayload = {
      risikoTataKelola: parseFloat(body.risikoTataKelola),
      sdmUmum: parseFloat(body.sdmUmum),
      keuangan: parseFloat(body.keuangan),
      it: parseFloat(body.it),
      operasional: parseFloat(body.operasional),
      bisnis: parseFloat(body.bisnis),
      cabang: parseFloat(body.cabang),
      enablerCount: parseInt(body.enablerCount),
      revenueGeneratorCount: parseInt(body.revenueGeneratorCount),
      divisionCount: parseInt(body.divisionCount),
      departmentCount: parseInt(body.departmentCount),
      avgSpanDepartment: parseInt(body.avgSpanDepartment),
      avgSpanEmployee: parseInt(body.avgSpanEmployee),
    };

    const result = await prisma.organizationStructureStat.upsert({
      where: {
        year_companyId: {
          year: parseInt(year),
          companyId: parseInt(companyId),
        },
      },
      // 2. Gunakan payload yang sudah jelas untuk update dan create
      update: scoresPayload,
      create: {
        year: parseInt(year),
        companyId: parseInt(companyId),
        ...scoresPayload,
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
