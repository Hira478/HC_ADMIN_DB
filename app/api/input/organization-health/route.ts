// app/api/input/organization-health/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, year } = body;

    // 1. Buat objek baru yang terdefinisi dengan jelas untuk semua skor
    // Ini memastikan TypeScript tahu persis field apa saja yang ada
    const scoresPayload = {
      accountability: parseFloat(body.accountability),
      motivation: parseFloat(body.motivation),
      coordinationControl: parseFloat(body.coordinationControl),
      leadership: parseFloat(body.leadership),
      innovationLearning: parseFloat(body.innovationLearning),
      externalOrientation: parseFloat(body.externalOrientation),
      direction: parseFloat(body.direction),
      capabilities: parseFloat(body.capabilities),
      workEnvironment: parseFloat(body.workEnvironment),
      totalScore: parseFloat(body.totalScore),
    };

    const result = await prisma.organizationHealthStat.upsert({
      where: {
        year_companyId: {
          year: parseInt(year),
          companyId: parseInt(companyId),
        },
      },
      // 2. Gunakan payload yang sudah jelas untuk update
      update: scoresPayload,
      // 3. Gunakan payload yang sudah jelas untuk create
      create: {
        year: parseInt(year),
        companyId: parseInt(companyId),
        ...scoresPayload,
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
