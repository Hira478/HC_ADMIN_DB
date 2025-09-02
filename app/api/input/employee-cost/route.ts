import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

interface EmployeeCostInput {
  year: number;
  month: number;
  companyId: number;
  salary: number;
  incentive: number;
  pension: number;
  others: number;
  trainingRecruitment: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmployeeCostInput = await request.json();
    const {
      year,
      month,
      companyId,
      salary,
      incentive,
      pension,
      others,
      trainingRecruitment,
    } = body;

    if (!companyId || !year || !month || isNaN(companyId)) {
      return NextResponse.json(
        { error: "Perusahaan, Tahun, dan Bulan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await prisma.employeeCostStat.upsert({
      where: {
        year_month_companyId: { year, month, companyId },
      },
      update: { salary, incentive, pension, others, trainingRecruitment },
      create: {
        year,
        month,
        companyId,
        salary,
        incentive,
        pension,
        others,
        trainingRecruitment,
      },
    });

    return NextResponse.json({
      message: "Data rincian biaya karyawan berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("API Input Employee Cost Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    );
  }
}
