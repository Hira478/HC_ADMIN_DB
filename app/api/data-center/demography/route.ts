import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Tipe data untuk payload yang diterima dari frontend
interface DemographyPayload {
  year: number;
  month: number;
  companyId: number;

  // Data dari setiap model/fieldset
  headcount?: { maleCount: number; femaleCount: number; totalCount: number };
  employeeStatus?: {
    permanentCount: number;
    contractCount: number;
    totalCount: number;
  };
  education?: {
    smaSmkCount: number;
    d3Count: number;
    s1Count: number;
    s2Count: number;
    s3Count: number;
    totalCount: number;
  };
  level?: {
    bod1Count: number;
    bod2Count: number;
    bod3Count: number;
    bod4Count: number;
    totalCount: number;
  };
  age?: {
    under25Count: number;
    age26to40Count: number;
    age41to50Count: number;
    over50Count: number;
    totalCount: number;
  };
  lengthOfService?: {
    los_0_5_Count: number;
    los_6_10_Count: number;
    los_11_15_Count: number;
    los_16_20_Count: number;
    los_21_25_Count: number;
    los_25_30_Count: number;
    los_over_30_Count: number;
    totalCount: number;
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

  // Penting: Cek otorisasi user Anper/Holding
  if (session.role !== "SUPER_ADMIN" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
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

// POST function (with corrections)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: DemographyPayload = await request.json();

  let targetCompanyId: number;
  if (session.role === "USER_ANPER" || session.role === "ADMIN_HOLDING") {
    targetCompanyId = session.companyId;
  } else if (session.role === "SUPER_ADMIN") {
    targetCompanyId = body.companyId;
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { year, month } = body;
  const whereClause = {
    year_month_companyId: { year, month, companyId: targetCompanyId },
  };

  // Cleaning data before sending to the database

  // headcount is left as is because its totalCount is in the DB
  const headcountData = body.headcount || {
    maleCount: 0,
    femaleCount: 0,
    totalCount: 0,
  };

  // For other data types, remove totalCount and ensure defaults
  const { totalCount: esTotal, ...employeeStatusPayload } =
    body.employeeStatus || {};
  const employeeStatusData = {
    permanentCount: 0,
    contractCount: 0,
    ...employeeStatusPayload,
  };

  const { totalCount: eduTotal, ...educationPayload } = body.education || {};
  const educationData = {
    smaSmkCount: 0,
    d3Count: 0,
    s1Count: 0,
    s2Count: 0,
    s3Count: 0,
    ...educationPayload,
  };

  const { totalCount: levelTotal, ...levelPayload } = body.level || {};
  const levelData = {
    bod1Count: 0,
    bod2Count: 0,
    bod3Count: 0,
    bod4Count: 0,
    ...levelPayload,
  };

  const { totalCount: ageTotal, ...agePayload } = body.age || {};
  const ageData = {
    under25Count: 0,
    age26to40Count: 0,
    age41to50Count: 0,
    over50Count: 0,
    ...agePayload,
  };

  const { totalCount: losTotal, ...losPayload } = body.lengthOfService || {};
  const lengthOfServiceData = {
    los_0_5_Count: 0,
    los_6_10_Count: 0,
    los_11_15_Count: 0,
    los_16_20_Count: 0,
    los_21_25_Count: 0,
    los_25_30_Count: 0,
    los_over_30_Count: 0,
    ...losPayload,
  };

  try {
    await prisma.$transaction([
      prisma.headcount.upsert({
        where: whereClause,
        update: headcountData,
        create: { year, month, companyId: targetCompanyId, ...headcountData },
      }),
      prisma.employeeStatusStat.upsert({
        where: whereClause,
        update: employeeStatusData,
        create: {
          year,
          month,
          companyId: targetCompanyId,
          ...employeeStatusData,
        },
      }),
      prisma.educationStat.upsert({
        where: whereClause,
        update: educationData,
        create: { year, month, companyId: targetCompanyId, ...educationData },
      }),
      prisma.levelStat.upsert({
        where: whereClause,
        update: levelData,
        create: { year, month, companyId: targetCompanyId, ...levelData },
      }),
      prisma.ageStat.upsert({
        where: whereClause,
        update: ageData,
        create: { year, month, companyId: targetCompanyId, ...ageData },
      }),
      prisma.lengthOfServiceStat.upsert({
        where: whereClause,
        update: lengthOfServiceData,
        create: {
          year,
          month,
          companyId: targetCompanyId,
          ...lengthOfServiceData,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Demographic data saved successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save demography data:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to save data.", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save data." },
      { status: 500 }
    );
  }
}
