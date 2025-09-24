import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

interface TurnoverExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  "Resign Count": number;
}

// "Kamus" untuk menerjemahkan bulan (mendukung B. Inggris & Indonesia)
const monthNameToNumber: { [key: string]: number } = {
  jan: 1,
  january: 1,
  januari: 1,
  feb: 2,
  february: 2,
  februari: 2,
  mar: 3,
  march: 3,
  maret: 3,
  apr: 4,
  april: 4,
  may: 5,
  mei: 5,
  jun: 6,
  june: 6,
  juni: 6,
  jul: 7,
  july: 7,
  juli: 7,
  aug: 8,
  august: 8,
  agustus: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
  desember: 12,
};

// --- FUNGSI "PEMBERSIH" BARU ---
// Fungsi ini akan membersihkan semua jenis spasi dan mengubah ke huruf kecil
const sanitizeString = (str: string | null | undefined): string => {
  if (!str) return "";
  // 1. Ganti spasi ganda/tab/baris baru menjadi satu spasi
  // 2. Hapus spasi di awal/akhir
  // 3. Ubah ke huruf kecil
  return str.toString().replace(/\s+/g, " ").trim().toLowerCase();
};

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
    const rows: TurnoverExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
    });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    // Gunakan fungsi pembersih saat membuat peta
    const companyMap = new Map(
      allCompanies.map((c) => [sanitizeString(c.name), c.id])
    );

    const dataToUpsert = rows
      .map((row) => {
        // Gunakan fungsi pembersih saat membaca dari Excel
        const companyName = sanitizeString(row.Company);
        const companyId = companyMap.get(companyName);

        const monthInput = sanitizeString(String(row.Month));
        const monthNumber = monthInput
          ? monthNameToNumber[monthInput] || Number(monthInput)
          : undefined;

        // Logging yang lebih detail
        if (!companyId || !row.Year || !monthNumber) {
          console.warn(
            `[VALIDASI GAGAL] Baris dilewati karena data tidak lengkap.`
          );
          if (!companyId)
            console.warn(
              `-> Penyebab: Nama Perusahaan tidak cocok. Dari Excel: "${row.Company}"`
            );
          if (!monthNumber)
            console.warn(
              `-> Penyebab: Nama Bulan tidak valid. Dari Excel: "${row.Month}"`
            );
          return null;
        }

        return {
          year: Number(row.Year),
          month: monthNumber,
          companyId: companyId,
          resignCount: Number(row["Resign Count"]) || 0,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ada data valid yang bisa diimpor dari file Excel Anda. Periksa nama perusahaan dan bulan.",
        },
        { status: 400 }
      );
    }

    // Batch Processing
    const batchSize = 200;
    for (let i = 0; i < dataToUpsert.length; i += batchSize) {
      const batch = dataToUpsert.slice(i, i + batchSize);
      await prisma.$transaction(
        batch.map((data) =>
          prisma.turnoverStat.upsert({
            where: {
              year_month_companyId: {
                year: data.year,
                month: data.month,
                companyId: data.companyId,
              },
            },
            update: { resignCount: data.resignCount },
            create: data,
          })
        )
      );
    }

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data Turnover berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/turnover:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
