// File: app/api/uploads/age/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// ## PERUBAHAN 1: Sesuaikan interface dengan kolom Excel baru
interface AgeExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  Category: string;
  "<=30 Years Old": number;
  "31-40 Years Old": number;
  "41-50 Years Old": number;
  "51-60 Years Old": number;
  ">60 Years Old": number;
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

// Interface for aggregated data, matching the new DB schema
interface AggregatedAgeStat {
  year: number;
  month: number;
  companyId: number;
  under25Permanent: number;
  under25Contract: number;
  age26to40Permanent: number;
  age26to40Contract: number;
  age41to50Permanent: number;
  age41to50Contract: number;
  age51to60Permanent: number;
  age51to60Contract: number;
  over60Permanent: number;
  over60Contract: number;
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
    const rows: AgeExcelRow[] = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    // ## PERUBAHAN 2: Proses agregasi data dari Excel
    const aggregationMap = new Map<string, AggregatedAgeStat>();

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
        under25Permanent: 0,
        under25Contract: 0,
        age26to40Permanent: 0,
        age26to40Contract: 0,
        age41to50Permanent: 0,
        age41to50Contract: 0,
        age51to60Permanent: 0,
        age51to60Contract: 0,
        over60Permanent: 0,
        over60Contract: 0,
      };

      // Map Excel columns to corresponding fields in the entry object
      const under25 = Number(row["<=30 Years Old"]) || 0; // Tetap menggunakan pemetaan ini
      const age26to40 = Number(row["31-40 Years Old"]) || 0;
      const age41to50 = Number(row["41-50 Years Old"]) || 0;
      const age51to60 = Number(row["51-60 Years Old"]) || 0;
      const over60 = Number(row[">60 Years Old"]) || 0;

      if (category === "permanent") {
        entry.under25Permanent += under25;
        entry.age26to40Permanent += age26to40;
        entry.age41to50Permanent += age41to50;
        entry.age51to60Permanent += age51to60;
        entry.over60Permanent += over60;
      } else if (category === "contract") {
        entry.under25Contract += under25;
        entry.age26to40Contract += age26to40;
        entry.age41to50Contract += age41to50;
        entry.age51to60Contract += age51to60;
        entry.over60Contract += over60;
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

    // ## PERUBAHAN 3: Lakukan upsert dengan data dan kolom baru
    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.ageStat.upsert({
          where: {
            year_month_companyId: {
              year: data.year,
              month: data.month,
              companyId: data.companyId,
            },
          },
          update: data, // update and create now use the same data structure
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} data demografi usia (berdasarkan bulan & perusahaan) berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/age:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
