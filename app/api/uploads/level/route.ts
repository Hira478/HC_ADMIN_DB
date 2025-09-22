// File: app/api/uploads/level/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk baris Excel. Gunakan kutip untuk nama properti dengan tanda hubung.
interface LevelExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  "BOD-1": number;
  "BOD-2": number;
  "BOD-3": number;
  "BOD-4": number;
}

// "Kamus" untuk menerjemahkan bulan
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

    const dataToUpsert = rows
      .map((row) => {
        const companyName = row.Company?.toString().trim().toLowerCase();
        const companyId = companyMap.get(companyName);
        const monthInput = row.Month?.toString().trim().toLowerCase();
        const monthNumber = monthInput
          ? monthNameToNumber[monthInput] || Number(monthInput)
          : undefined;

        if (!companyId || !row.Year || !monthNumber) {
          console.warn(
            `Data tidak lengkap atau perusahaan/bulan tidak valid. Baris dilewati:`,
            row
          );
          return null;
        }

        return {
          year: Number(row.Year),
          month: monthNumber,
          companyId: companyId,
          // --- PEMETAAN KOLOM EXCEL KE DATABASE ---
          // Gunakan bracket notation ['...'] untuk mengakses properti dengan tanda hubung
          bod1Count: Number(row["BOD-1"]) || 0,
          bod2Count: Number(row["BOD-2"]) || 0,
          bod3Count: Number(row["BOD-3"]) || 0,
          bod4Count: Number(row["BOD-4"]) || 0,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

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
          update: {
            bod1Count: data.bod1Count,
            bod2Count: data.bod2Count,
            bod3Count: data.bod3Count,
            bod4Count: data.bod4Count,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data level jabatan berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/level:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
