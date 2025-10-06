// File: app/api/demography/manual-input/route.ts (asumsi path)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ## PERUBAHAN 1: Definisikan ulang payload dari frontend
interface DemographyPayload {
  year: number;
  month: number;
  companyId: number;
  statusType: "permanent" | "contract"; // <-- Kunci untuk toggle

  // Data disederhanakan, tanpa akhiran 'Count'
  headcount?: { male: number; female: number };
  education?: {
    smaSmk: number;
    d3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  level?: { bod1: number; bod2: number; bod3: number; bod4: number };
  age?: {
    under25: number;
    age26to40: number;
    age41to50: number;
    over50: number;
  };
  lengthOfService?: {
    los_0_5: number;
    los_6_10: number;
    los_11_15: number;
    los_16_20: number;
    los_21_25: number;
    los_25_30: number;
    los_over_30: number;
  };
}

/**
 * GET: Mengambil data demografi yang ada dengan skema baru
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");
  const companyId = parseInt(searchParams.get("companyId") || "");

  if (isNaN(year) || isNaN(month) || isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  // Otorisasi: User hanya boleh akses data perusahaannya sendiri (kecuali SUPER_ADMIN)
  if (session.role !== "SUPER_ADMIN" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const whereClause = { year_month_companyId: { year, month, companyId } };

    // ## PERUBAHAN 2: Hapus employeeStatusStat, ambil data dengan skema baru
    const [headcount, education, level, age, lengthOfService] =
      await prisma.$transaction([
        prisma.headcount.findUnique({ where: whereClause }),
        prisma.educationStat.findUnique({ where: whereClause }),
        prisma.levelStat.findUnique({ where: whereClause }),
        prisma.ageStat.findUnique({ where: whereClause }),
        prisma.lengthOfServiceStat.findUnique({ where: whereClause }),
      ]);

    return NextResponse.json({
      headcount,
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
 * POST: Menyimpan data demografi (Permanent atau Contract)
 * Versi yang disempurnakan: Type-safe dan lebih eksplisit.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: DemographyPayload = await request.json();
  const { year, month, companyId, statusType } = body;

  if (session.role !== "SUPER_ADMIN" && session.companyId !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!statusType || !["permanent", "contract"].includes(statusType)) {
    return NextResponse.json(
      { error: "Tipe status (permanent/contract) diperlukan." },
      { status: 400 }
    );
  }

  try {
    const whereClause = { year_month_companyId: { year, month, companyId } };

    // ## PERBAIKAN: Gunakan satu blok transaksi yang bersih dan type-safe
    await prisma.$transaction(async (tx) => {
      // --- 1. Headcount ---
      const existingHeadcount = await tx.headcount.findUnique({
        where: whereClause,
      });
      const hcPayload = body.headcount || { male: 0, female: 0 };
      const hcData = {
        malePermanent: existingHeadcount?.malePermanent ?? 0,
        femalePermanent: existingHeadcount?.femalePermanent ?? 0,
        maleContract: existingHeadcount?.maleContract ?? 0,
        femaleContract: existingHeadcount?.femaleContract ?? 0,
      };
      if (statusType === "permanent") {
        hcData.malePermanent = hcPayload.male;
        hcData.femalePermanent = hcPayload.female;
      } else {
        hcData.maleContract = hcPayload.male;
        hcData.femaleContract = hcPayload.female;
      }
      const totalCount =
        hcData.malePermanent +
        hcData.femalePermanent +
        hcData.maleContract +
        hcData.femaleContract;
      await tx.headcount.upsert({
        where: whereClause,
        update: { ...hcData, totalCount },
        create: { year, month, companyId, ...hcData, totalCount },
      });

      // --- 2. Education ---
      const existingEdu = await tx.educationStat.findUnique({
        where: whereClause,
      });
      const eduPayload = body.education || {
        smaSmk: 0,
        d3: 0,
        s1: 0,
        s2: 0,
        s3: 0,
      };
      const eduData = { ...existingEdu }; // Salin semua field untuk menjaga nilai yang tidak diubah
      if (statusType === "permanent") {
        eduData.smaSmkPermanent = eduPayload.smaSmk;
        eduData.d3Permanent = eduPayload.d3;
        eduData.s1Permanent = eduPayload.s1;
        eduData.s2Permanent = eduPayload.s2;
        eduData.s3Permanent = eduPayload.s3;
      } else {
        eduData.smaSmkContract = eduPayload.smaSmk;
        eduData.d3Contract = eduPayload.d3;
        eduData.s1Contract = eduPayload.s1;
        eduData.s2Contract = eduPayload.s2;
        eduData.s3Contract = eduPayload.s3;
      }
      await tx.educationStat.upsert({
        where: whereClause,
        update: eduData,
        create: { year, month, companyId, ...eduData },
      });

      // --- 3. Age ---
      const existingAge = await tx.ageStat.findUnique({ where: whereClause });
      const agePayload = body.age || {
        under25: 0,
        age26to40: 0,
        age41to50: 0,
        over50: 0,
      };
      const ageData = { ...existingAge };
      if (statusType === "permanent") {
        ageData.under25Permanent = agePayload.under25;
        ageData.age26to40Permanent = agePayload.age26to40;
        ageData.age41to50Permanent = agePayload.age41to50;
        ageData.over50Permanent = agePayload.over50;
      } else {
        ageData.under25Contract = agePayload.under25;
        ageData.age26to40Contract = agePayload.age26to40;
        ageData.age41to50Contract = agePayload.age41to50;
        ageData.over50Contract = agePayload.over50;
      }
      await tx.ageStat.upsert({
        where: whereClause,
        update: ageData,
        create: { year, month, companyId, ...ageData },
      });

      // --- 4. Level ---
      const existingLevel = await tx.levelStat.findUnique({
        where: whereClause,
      });
      const levelPayload = body.level || { bod1: 0, bod2: 0, bod3: 0, bod4: 0 };
      const levelData = { ...existingLevel };
      if (statusType === "permanent") {
        levelData.bod1Permanent = levelPayload.bod1;
        levelData.bod2Permanent = levelPayload.bod2;
        levelData.bod3Permanent = levelPayload.bod3;
        levelData.bod4Permanent = levelPayload.bod4;
      } else {
        levelData.bod1Contract = levelPayload.bod1;
        levelData.bod2Contract = levelPayload.bod2;
        levelData.bod3Contract = levelPayload.bod3;
        levelData.bod4Contract = levelPayload.bod4;
      }
      await tx.levelStat.upsert({
        where: whereClause,
        update: levelData,
        create: { year, month, companyId, ...levelData },
      });

      // --- 5. Length of Service ---
      const existingLos = await tx.lengthOfServiceStat.findUnique({
        where: whereClause,
      });
      const losPayload = body.lengthOfService || {
        los_0_5: 0,
        los_6_10: 0,
        los_11_15: 0,
        los_16_20: 0,
        los_21_25: 0,
        los_25_30: 0,
        los_over_30: 0,
      };
      const losData = { ...existingLos };
      if (statusType === "permanent") {
        losData.los_0_5_Permanent = losPayload.los_0_5;
        losData.los_6_10_Permanent = losPayload.los_6_10;
        // ... Lanjutkan untuk semua rentang LoS
        losData.los_11_15_Permanent = losPayload.los_11_15;
        losData.los_16_20_Permanent = losPayload.los_16_20;
        losData.los_21_25_Permanent = losPayload.los_21_25;
        losData.los_25_30_Permanent = losPayload.los_25_30;
        losData.los_over_30_Permanent = losPayload.los_over_30;
      } else {
        losData.los_0_5_Contract = losPayload.los_0_5;
        losData.los_6_10_Contract = losPayload.los_6_10;
        // ... Lanjutkan untuk semua rentang LoS
        losData.los_11_15_Contract = losPayload.los_11_15;
        losData.los_16_20_Contract = losPayload.los_16_20;
        losData.los_21_25_Contract = losPayload.los_21_25;
        losData.los_25_30_Contract = losPayload.los_25_30;
        losData.los_over_30_Contract = losPayload.los_over_30;
      }
      await tx.lengthOfServiceStat.upsert({
        where: whereClause,
        update: losData,
        create: { year, month, companyId, ...losData },
      });
    });

    return NextResponse.json(
      { message: "Data demografi berhasil disimpan." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal menyimpan data demografi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data." },
      { status: 500 }
    );
  }
}
