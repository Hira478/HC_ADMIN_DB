// File: app/api/uploads/education/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// ## PERUBAHAN 1: Sesuaikan interface dengan kolom Excel baru
interface EducationExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  Category: string;
  "<D3": number; // Using quotes for special characters
  D3: number;
  S1: number;
  S2: number;
  S3: number;
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
interface AggregatedEducationStat {
  year: number;
  month: number;
  companyId: number;
  smaSmkPermanent: number;
  smaSmkContract: number;
  d3Permanent: number;
  d3Contract: number;
  s1Permanent: number;
  s1Contract: number;
  s2Permanent: number;
  s2Contract: number;
  s3Permanent: number;
  s3Contract: number;
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
    const rows: EducationExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
    });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    // ## PERUBAHAN 2: Proses agregasi data dari Excel
    const aggregationMap = new Map<string, AggregatedEducationStat>();

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
        smaSmkPermanent: 0,
        smaSmkContract: 0,
        d3Permanent: 0,
        d3Contract: 0,
        s1Permanent: 0,
        s1Contract: 0,
        s2Permanent: 0,
        s2Contract: 0,
        s3Permanent: 0,
        s3Contract: 0,
      };

      const smaSmkCount = Number(row["<D3"]) || 0;
      const d3Count = Number(row.D3) || 0;
      const s1Count = Number(row.S1) || 0;
      const s2Count = Number(row.S2) || 0;
      const s3Count = Number(row.S3) || 0;

      if (category === "permanent") {
        entry.smaSmkPermanent += smaSmkCount;
        entry.d3Permanent += d3Count;
        entry.s1Permanent += s1Count;
        entry.s2Permanent += s2Count;
        entry.s3Permanent += s3Count;
      } else if (category === "contract") {
        entry.smaSmkContract += smaSmkCount;
        entry.d3Contract += d3Count;
        entry.s1Contract += s1Count;
        entry.s2Contract += s2Count;
        entry.s3Contract += s3Count;
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
        prisma.educationStat.upsert({
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
      message: `${dataToUpsert.length} data demografi edukasi (berdasarkan bulan & perusahaan) berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/education:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
