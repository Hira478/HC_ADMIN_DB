import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// Definisikan bentuk data yang diharapkan dari form gabungan
interface CombinedInput {
  year: number;
  month: number;
  companyId: number;
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
  kpiKorporasi: number;
  kpiHcTransformation: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CombinedInput = await request.json();

    const {
      year,
      month,
      companyId,
      revenue,
      netProfit,
      totalEmployeeCost,
      kpiKorporasi,
      kpiHcTransformation,
    } = body;

    if (!companyId || !year || !month || isNaN(companyId)) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    // Kunci unik yang akan digunakan untuk kedua tabel
    const commonWhere = {
      year_month_companyId: { year, month, companyId },
    };

    // Gunakan transaksi untuk memastikan integritas data
    await prisma.$transaction([
      // Operasi 1: Upsert ke tabel ProductivityStat
      prisma.productivityStat.upsert({
        where: commonWhere,
        update: { revenue, netProfit, totalEmployeeCost },
        create: {
          year,
          month,
          companyId,
          revenue,
          netProfit,
          totalEmployeeCost,
        },
      }),
      // Operasi 2: Upsert ke tabel KpiStat
      prisma.kpiStat.upsert({
        where: commonWhere,
        update: { kpiKorporasi, kpiHcTransformation },
        create: { year, month, companyId, kpiKorporasi, kpiHcTransformation },
      }),
    ]);

    return NextResponse.json({
      message: "Data Productivity & KPI berhasil disimpan/diperbarui.",
    });
  } catch (error) {
    console.error("API Input Productivity/KPI Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    );
  }
}
