// File: app/api/uploads/service-length/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// ## 1. SESUAIKAN INTERFACE DENGAN HEADER EXCEL ##
// Perhatikan penggunaan kutip untuk header dengan spasi/simbol
interface LosExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  Category: string;
  "0-5 Years": number;
  "6-10 Years": number;
  "11-15 Years": number;
  "16-20 years": number;
  "21-25 Years": number;
  "26-30 years": number;
  ">30 Years": number;
}

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

// Interface untuk data yang sudah diagregasi
interface AggregatedLosStat {
  year: number;
  month: number;
  companyId: number;
  los_0_5_Permanent: number;
  los_0_5_Contract: number;
  los_6_10_Permanent: number;
  los_6_10_Contract: number;
  los_11_15_Permanent: number;
  los_11_15_Contract: number;
  los_16_20_Permanent: number;
  los_16_20_Contract: number;
  los_21_25_Permanent: number;
  los_21_25_Contract: number;
  los_25_30_Permanent: number;
  los_25_30_Contract: number;
  los_over_30_Permanent: number;
  los_over_30_Contract: number;
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
    const rows: LosExcelRow[] = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    // ## 2. LOGIKA AGREGRASI DATA DARI EXCEL ##
    const aggregationMap = new Map<string, AggregatedLosStat>();

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
        los_0_5_Permanent: 0,
        los_0_5_Contract: 0,
        los_6_10_Permanent: 0,
        los_6_10_Contract: 0,
        los_11_15_Permanent: 0,
        los_11_15_Contract: 0,
        los_16_20_Permanent: 0,
        los_16_20_Contract: 0,
        los_21_25_Permanent: 0,
        los_21_25_Contract: 0,
        los_25_30_Permanent: 0,
        los_25_30_Contract: 0,
        los_over_30_Permanent: 0,
        los_over_30_Contract: 0,
      };

      const los0_5 = Number(row["0-5 Years"]) || 0;
      const los6_10 = Number(row["6-10 Years"]) || 0;
      const los11_15 = Number(row["11-15 Years"]) || 0;
      const los16_20 = Number(row["16-20 years"]) || 0;
      const los21_25 = Number(row["21-25 Years"]) || 0;
      const los26_30 = Number(row["26-30 years"]) || 0;
      const losOver30 = Number(row[">30 Years"]) || 0;

      if (category === "permanent") {
        entry.los_0_5_Permanent += los0_5;
        entry.los_6_10_Permanent += los6_10;
        entry.los_11_15_Permanent += los11_15;
        entry.los_16_20_Permanent += los16_20;
        entry.los_21_25_Permanent += los21_25;
        entry.los_25_30_Permanent += los26_30;
        entry.los_over_30_Permanent += losOver30;
      } else if (category === "contract") {
        entry.los_0_5_Contract += los0_5;
        entry.los_6_10_Contract += los6_10;
        entry.los_11_15_Contract += los11_15;
        entry.los_16_20_Contract += los16_20;
        entry.los_21_25_Contract += los21_25;
        entry.los_25_30_Contract += los26_30;
        entry.los_over_30_Contract += losOver30;
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

    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.lengthOfServiceStat.upsert({
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
      message: `${dataToUpsert.length} data masa kerja (berdasarkan bulan & perusahaan) berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/service-length:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
