// File: app/api/data-center/demography/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan path ke client prisma Anda benar
import { getSession } from "@/lib/session"; // Pastikan path ke session Anda benar

// Tipe data untuk payload yang diterima dari frontend
interface DemographyPayload {
  year: number;
  month: number;
  companyId: number;

  // Data dari setiap model/fieldset
  headcount?: { maleCount: number; femaleCount: number; totalCount: number };
  employeeStatus?: { permanentCount: number; contractCount: number };
  education?: {
    smaSmkCount: number;
    d3Count: number;
    s1Count: number;
    s2Count: number;
    s3Count: number;
  };
  level?: {
    bod1Count: number;
    bod2Count: number;
    bod3Count: number;
    bod4Count: number;
  };
  age?: {
    under25Count: number;
    age26to40Count: number;
    age41to50Count: number;
    over50Count: number;
  };
  lengthOfService?: {
    los_0_5_Count: number;
    los_6_10_Count: number;
    los_11_15_Count: number;
    los_16_20_Count: number;
    los_21_25_Count: number;
    los_25_30_Count: number;
    los_over_30_Count: number;
  };
}

/**
 * Handler untuk GET request.
 * Mengambil semua data demografi terkait berdasarkan filter.
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

  // Penting: Cek otorisasi user Anper
  if (session.role === "USER_ANPER" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Menggunakan $transaction untuk mengambil semua data secara paralel
    const [headcount, employeeStatus, education, level, age, lengthOfService] =
      await prisma.$transaction([
        prisma.headcount.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
        prisma.employeeStatusStat.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
        prisma.educationStat.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
        prisma.levelStat.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
        prisma.ageStat.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
        prisma.lengthOfServiceStat.findUnique({
          where: { year_month_companyId: { year, month, companyId } },
        }),
      ]);

    return NextResponse.json({
      headcount,
      employeeStatus,
      education,
      level,
      age,
      lengthOfService,
    });
  } catch (error) {
    console.error("Failed to fetch demography data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handler untuk POST request.
 * Membuat atau mengupdate (upsert) data demografi.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: DemographyPayload = await request.json();

  // LOGIKA ISOLASI DATA (SANGAT PENTING!)
  let targetCompanyId: number;
  if (session.role === "USER_ANPER") {
    // Jika user adalah Anper, paksa companyId menjadi milik mereka.
    // Ini mencegah user Anper mengirim data untuk perusahaan lain.
    targetCompanyId = session.companyId;
  } else if (
    session.role === "ADMIN_HOLDING" ||
    session.role === "SUPER_ADMIN"
  ) {
    // Jika Holding atau Super Admin, percayai companyId dari body request.
    targetCompanyId = body.companyId;
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { year, month } = body;
  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };

  try {
    // Menggunakan transaction agar semua operasi berhasil atau semua gagal.
    await prisma.$transaction([
      // Upsert Headcount
      prisma.headcount.upsert({
        where: whereClause,
        update: { ...body.headcount },
        create: { year, month, companyId: targetCompanyId, ...body.headcount! },
      }),
      // Upsert Employee Status
      prisma.employeeStatusStat.upsert({
        where: whereClause,
        update: { ...body.employeeStatus },
        create: {
          year,
          month,
          companyId: targetCompanyId,
          ...body.employeeStatus!,
        },
      }),
      // Upsert Education
      prisma.educationStat.upsert({
        where: whereClause,
        update: { ...body.education },
        create: { year, month, companyId: targetCompanyId, ...body.education! },
      }),
      // Upsert Level
      prisma.levelStat.upsert({
        where: whereClause,
        update: { ...body.level },
        create: { year, month, companyId: targetCompanyId, ...body.level! },
      }),
      // Upsert Age
      prisma.ageStat.upsert({
        where: whereClause,
        update: { ...body.age },
        create: { year, month, companyId: targetCompanyId, ...body.age! },
      }),
      // Upsert Length of Service
      prisma.lengthOfServiceStat.upsert({
        where: whereClause,
        update: { ...body.lengthOfService },
        create: {
          year,
          month,
          companyId: targetCompanyId,
          ...body.lengthOfService!,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Data demografi berhasil disimpan." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save demography data:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data." },
      { status: 500 }
    );
  }
}
