import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Ambil field yang sudah disederhanakan: 'revenue' dan 'netProfit'
    const { year, month, companyId, revenue, netProfit } = body;

    if (!companyId || !year || !month) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await prisma.productivityStat.upsert({
      where: {
        year_month_companyId: {
          year: Number(year),
          month: Number(month),
          companyId: companyId,
        },
      },
      // Data yang diupdate harus 'revenue' dan 'netProfit'
      update: { revenue, netProfit },
      // Data yang dibuat juga harus 'revenue' dan 'netProfit'
      create: {
        year: Number(year),
        month: Number(month),
        companyId,
        revenue,
        netProfit,
      },
    });

    return NextResponse.json({
      message: "Data produktivitas berhasil disimpan/diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("API Ingest Productivity Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    );
  }
}
