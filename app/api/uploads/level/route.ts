// File: app/api/uploads/level/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// ## 1. SESUAIKAN INTERFACE DENGAN HEADER EXCEL BARU ##
interface LevelExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  Category: string; // <-- Kolom baru
  "BOD-1": number;
  "BOD-2": number;
  "BOD-3": number;
  "BOD-4": number;
}

// "Kamus" bulan, tidak perlu diubah
const monthNameToNumber: { [key: string]: number } = {
  januari: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agustus: 8,
  sep: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
};

// Interface untuk data yang sudah diagregasi, sesuai skema DB baru
interface AggregatedLevelStat {
  year: number;
  month: number;
  companyId: number;
  bod1Permanent: number;
  bod1Contract: number;
  bod2Permanent: number;
  bod2Contract: number;
  bod3Permanent: number;
  bod3Contract: number;
  bod4Permanent: number;
  bod4Contract: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "ADMIN_HOLDING" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file)
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 400 }
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: LevelExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
    });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    // ## 2. LOGIKA AGREGRASI DATA DARI EXCEL ##
    const aggregationMap = new Map<string, AggregatedLevelStat>();

    for (const row of rows) {
      const companyName = row.Company?.toString().trim().toLowerCase();
      const companyId = companyMap.get(companyName);
      const monthInput = row.Month?.toString().trim().toLowerCase();
      const monthNumber = monthInput
        ? monthNameToNumber[monthInput] || Number(monthInput)
        : undefined;
      const year = Number(row.Year);
      const category = row.Category?.trim().toLowerCase();

      if (!companyId || !year || !monthNumber || !category) {
        console.warn(`Baris data tidak lengkap, dilewati:`, row);
        continue;
      }

      const key = `${year}-${monthNumber}-${companyId}`;
      const entry = aggregationMap.get(key) || {
        year,
        month: monthNumber,
        companyId,
        bod1Permanent: 0,
        bod1Contract: 0,
        bod2Permanent: 0,
        bod2Contract: 0,
        bod3Permanent: 0,
        bod3Contract: 0,
        bod4Permanent: 0,
        bod4Contract: 0,
      };

      const bod1 = Number(row["BOD-1"]) || 0;
      const bod2 = Number(row["BOD-2"]) || 0;
      const bod3 = Number(row["BOD-3"]) || 0;
      const bod4 = Number(row["BOD-4"]) || 0;

      if (category === "permanent") {
        entry.bod1Permanent += bod1;
        entry.bod2Permanent += bod2;
        entry.bod3Permanent += bod3;
        entry.bod4Permanent += bod4;
      } else if (category === "contract") {
        entry.bod1Contract += bod1;
        entry.bod2Contract += bod2;
        entry.bod3Contract += bod3;
        entry.bod4Contract += bod4;
      }

      aggregationMap.set(key, entry);
    }

    const dataToUpsert = Array.from(aggregationMap.values());

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

    // ## 3. LAKUKAN UPSERT DENGAN DATA DAN KOLOM BARU ##
    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.levelStat.upsert({
          where: {
            year_month_companyId: {
              year: data.year,
              month: data.month,
              companyId: data.companyId,
            },
          },
          update: data,
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} data level jabatan (berdasarkan bulan & perusahaan) berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/level:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
