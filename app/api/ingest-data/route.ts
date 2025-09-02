import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ambil semua data dari body request
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
      // ...tambahkan field lain
    } = body;

    if (!companyId || !year || !month) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const totalHeadcount = maleCount + femaleCount;

    // Gunakan upsert: update jika data sudah ada, create jika belum ada
    const commonWhere = { year_month_companyId: { year, month, companyId } };

    // Prisma Transaction: Semua operasi di bawah ini akan berhasil, atau semua akan gagal.
    await prisma.$transaction([
      prisma.headcount.upsert({
        where: commonWhere,
        update: { totalCount: totalHeadcount, maleCount, femaleCount },
        create: {
          year,
          month,
          companyId,
          totalCount: totalHeadcount,
          maleCount,
          femaleCount,
        },
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
      // ... Tambahkan prisma.levelStat.upsert(...)
      // ... Tambahkan prisma.ageStat.upsert(...)
      // ... Tambahkan prisma.lengthOfServiceStat.upsert(...)
    ]);

    return NextResponse.json({ message: "Data berhasil disimpan/diperbarui." });
  } catch (error) {
    console.error("API Ingest Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    );
  }
}
