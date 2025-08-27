// app/api/charts/formation-rasio/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");

  if (!companyId || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const companyIdNum = parseInt(companyId);
  const yearNum = parseInt(year);

  try {
    // 1. Ambil data rasio per bulan dari tabel baru
    const rasioRecords = await prisma.formationRasioStat.findMany({
      where: { year: yearNum, companyId: companyIdNum },
      orderBy: { month: "asc" },
    });

    // 2. Ambil data total headcount per bulan
    const headcountRecords = await prisma.headcount.findMany({
      where: { year: yearNum, companyId: companyIdNum },
      orderBy: { month: "asc" },
    });

    // Buat map untuk akses cepat total headcount
    const headcountMap = new Map(
      headcountRecords.map((h) => [h.month, h.totalCount])
    );

    // 3. Gabungkan data: hanya proses bulan yang memiliki data rasio
    const responseData = rasioRecords.map((record) => {
      return {
        month: new Date(0, record.month - 1).toLocaleString("en-US", {
          month: "long",
        }),
        totalHeadcount: headcountMap.get(record.month) || 0, // Ambil total dari tabel Headcount
        // Data mentah per kategori
        categories: {
          "R&D": record.rd,
          Business: record.business,
          Finance: record.finance,
          "Human Resources": record.humanResources,
          Actuary: record.actuary,
          Compliance: record.compliance,
          Legal: record.legal,
          IT: record.informationTechnology,
          "Corporate Secretary": record.corporateSecretary,
          "General Affairs": record.generalAffairs,
        },
      };
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch formation rasio data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
