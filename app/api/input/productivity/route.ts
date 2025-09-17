// File: app/api/input/productivity/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { UserRole } from "@prisma/client";

// Definisikan bentuk data yang diharapkan dari form baru
interface CombinedInput {
  year: number;
  month: number;
  companyId: number;
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
  totalCost: number;
  kpiFinansial: number;
  kpiOperasional: number;
  kpiSosial: number;
  kpiInovasiBisnis: number;
  kpiKepemimpinanTeknologi: number;
  kpiPeningkatanInvestasi: number;
  kpiPengembanganTalenta: number;
  totalScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const body: CombinedInput = await request.json();

    // Logika Keamanan: Paksa companyId sesuai sesi jika user adalah ANPER
    if (session.role === UserRole.USER_ANPER) {
      body.companyId = session.companyId;
    }

    const {
      year,
      month,
      companyId,
      revenue,
      netProfit,
      totalEmployeeCost,
      totalCost,
      ...kpiData
    } = body;

    if (!companyId || !year || !month) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const commonWhere = { year_month_companyId: { year, month, companyId } };

    await prisma.$transaction([
      // Operasi 1: Upsert ke tabel ProductivityStat
      prisma.productivityStat.upsert({
        where: commonWhere,
        update: { revenue, netProfit, totalEmployeeCost, totalCost },
        create: {
          year,
          month,
          companyId,
          revenue,
          netProfit,
          totalEmployeeCost,
          totalCost,
        },
      }),
      // Operasi 2: Upsert ke tabel KpiStat dengan data baru
      prisma.kpiStat.upsert({
        where: commonWhere,
        update: kpiData,
        create: { year, month, companyId, ...kpiData },
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
