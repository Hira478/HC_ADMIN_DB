import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Definisikan bentuk data yang diharapkan dari frontend
interface ProductivityInput {
  year: number;
  month: number;
  companyId: number;
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
}

export async function POST(request: NextRequest) {
  try {
    // Terapkan tipe pada body request
    const body: ProductivityInput = await request.json();

    const { year, month, companyId, revenue, netProfit, totalEmployeeCost } =
      body;

    if (!companyId || !year || !month || isNaN(companyId)) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await prisma.productivityStat.upsert({
      where: {
        year_month_companyId: { year, month, companyId },
      },
      update: { revenue, netProfit, totalEmployeeCost },
      create: { year, month, companyId, revenue, netProfit, totalEmployeeCost },
    });

    return NextResponse.json({
      message: "Data produktivitas berhasil disimpan/diperbarui.",
      data: result,
    });
  } catch (error) {
    // Blok catch yang aman
    console.error("API Input Productivity Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Gagal menyimpan data: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    );
  }
}
