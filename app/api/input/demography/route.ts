import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// Definisikan interface untuk bentuk data yang diharapkan dari frontend
interface DemographyInput {
  year: number;
  month: number;
  companyId: number;
  maleCount: number;
  femaleCount: number;
  permanentCount: number;
  contractCount: number;
  smaSmkCount: number;
  d3Count: number;
  s1Count: number;
  s2Count: number;
  s3Count: number;
  bod1Count: number;
  bod2Count: number;
  bod3Count: number;
  bod4Count: number;
  under25Count: number;
  age26to40Count: number;
  age41to50Count: number;
  over50Count: number;
  los_0_5_Count: number;
  los_6_10_Count: number;
  los_11_15_Count: number;
  los_16_20_Count: number;
  los_21_25_Count: number;
  los_25_30_Count: number;
  los_over_30_Count: number;
}

export async function POST(request: NextRequest) {
  try {
    // Terapkan tipe DemographyInput pada body request
    const body: DemographyInput = await request.json();

    // Ekstrak data (sekarang sudah memiliki tipe yang benar)
    const {
      year,
      month,
      companyId,
      maleCount,
      femaleCount,
      permanentCount,
      contractCount,
      smaSmkCount,
      d3Count,
      s1Count,
      s2Count,
      s3Count,
      bod1Count,
      bod2Count,
      bod3Count,
      bod4Count,
      under25Count,
      age26to40Count,
      age41to50Count,
      over50Count,
      los_0_5_Count,
      los_6_10_Count,
      los_11_15_Count,
      los_16_20_Count,
      los_21_25_Count,
      los_25_30_Count,
      los_over_30_Count,
    } = body;

    if (!companyId || !year || !month) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const totalCount = maleCount + femaleCount;
    const commonWhere = { year_month_companyId: { year, month, companyId } };

    // Transaksi Prisma (tidak berubah)
    await prisma.$transaction([
      prisma.headcount.upsert({
        where: commonWhere,
        update: { totalCount, maleCount, femaleCount },
        create: { year, month, companyId, totalCount, maleCount, femaleCount },
      }),
      prisma.employeeStatusStat.upsert({
        where: commonWhere,
        update: { permanentCount, contractCount },
        create: { year, month, companyId, permanentCount, contractCount },
      }),
      prisma.educationStat.upsert({
        where: commonWhere,
        update: { smaSmkCount, d3Count, s1Count, s2Count, s3Count },
        create: {
          year,
          month,
          companyId,
          smaSmkCount,
          d3Count,
          s1Count,
          s2Count,
          s3Count,
        },
      }),
      prisma.levelStat.upsert({
        where: commonWhere,
        update: { bod1Count, bod2Count, bod3Count, bod4Count },
        create: {
          year,
          month,
          companyId,
          bod1Count,
          bod2Count,
          bod3Count,
          bod4Count,
        },
      }),
      prisma.ageStat.upsert({
        where: commonWhere,
        update: { under25Count, age26to40Count, age41to50Count, over50Count },
        create: {
          year,
          month,
          companyId,
          under25Count,
          age26to40Count,
          age41to50Count,
          over50Count,
        },
      }),
      prisma.lengthOfServiceStat.upsert({
        where: commonWhere,
        update: {
          los_0_5_Count,
          los_6_10_Count,
          los_11_15_Count,
          los_16_20_Count,
          los_21_25_Count,
          los_25_30_Count,
          los_over_30_Count,
        },
        create: {
          year,
          month,
          companyId,
          los_0_5_Count,
          los_6_10_Count,
          los_11_15_Count,
          los_16_20_Count,
          los_21_25_Count,
          los_25_30_Count,
          los_over_30_Count,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Data demografi berhasil disimpan/diperbarui.",
    });
  } catch (error) {
    // Blok catch yang aman
    console.error("API Input Demography Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Gagal menyimpan data: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Gagal menyimpan data ke database karena kesalahan tidak diketahui.",
      },
      { status: 500 }
    );
  }
}
