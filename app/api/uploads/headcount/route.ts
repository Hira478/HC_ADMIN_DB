// File: app/api/uploads/headcount/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// ## PERUBAHAN 1: Sesuaikan interface dengan kolom Excel baru
interface HeadcountExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  Category: string; // <-- Kolom baru yang krusial
  Male: number;
  Female: number;
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

// Interface untuk data yang sudah diagregasi
interface AggregatedHeadcount {
  year: number;
  month: number;
  companyId: number;
  malePermanent: number;
  maleContract: number;
  femalePermanent: number;
  femaleContract: number;
  totalCount: number;
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
    const rows: HeadcountExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
    });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    // ## PERUBAHAN 2: Proses agregasi data dari Excel
    const aggregationMap = new Map<string, AggregatedHeadcount>();

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
        continue; // Lanjut ke baris berikutnya
      }

      // Buat kunci unik untuk setiap entri database
      const key = `${year}-${monthNumber}-${companyId}`;

      // Ambil data yang sudah ada atau buat objek baru
      const entry = aggregationMap.get(key) || {
        year,
        month: monthNumber,
        companyId,
        malePermanent: 0,
        maleContract: 0,
        femalePermanent: 0,
        femaleContract: 0,
        totalCount: 0,
      };

      const maleCount = Number(row.Male) || 0;
      const femaleCount = Number(row.Female) || 0;

      // Akumulasi data berdasarkan kategori
      if (category === "permanent") {
        entry.malePermanent += maleCount;
        entry.femalePermanent += femaleCount;
      } else if (category === "contract") {
        // Anda bisa tambahkan kategori lain jika perlu
        entry.maleContract += maleCount;
        entry.femaleContract += femaleCount;
      }

      aggregationMap.set(key, entry);
    }

    // Ubah map menjadi array dan hitung totalCount
    const dataToUpsert = Array.from(aggregationMap.values()).map((data) => {
      data.totalCount =
        data.malePermanent +
        data.maleContract +
        data.femalePermanent +
        data.femaleContract;
      return data;
    });

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

    // ## PERUBAHAN 3: Lakukan upsert dengan data dan kolom baru
    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.headcount.upsert({
          where: {
            year_month_companyId: {
              year: data.year,
              month: data.month,
              companyId: data.companyId,
            },
          },
          update: {
            malePermanent: data.malePermanent,
            maleContract: data.maleContract,
            femalePermanent: data.femalePermanent,
            femaleContract: data.femaleContract,
            totalCount: data.totalCount,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} data headcount (berdasarkan bulan & perusahaan) berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/headcount:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
