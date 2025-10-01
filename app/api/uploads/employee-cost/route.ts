import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

interface CostExcelRow {
  Year: number;
  Month: number | string;
  Perusahaan?: string;
  Company?: string;
  "Management Cost": string | number;
  "Employee Cost": string | number;
  Recruitment: string | number;
  Secondment: string | number;
  Others: string | number;
  Total: string | number;
}

// --- FUNGSI PARSENUMBER DIPERBAIKI DI SINI ---
/**
 * Mengubah string angka (misal: "11.112" atau "37,086") menjadi angka murni.
 * Fungsi ini sekarang menghapus titik dan koma yang berfungsi sebagai pemisah ribuan.
 */
const parseNumber = (value: string | number | null | undefined): number => {
  // Jika sudah berupa angka, langsung kembalikan
  if (typeof value === "number") {
    return value;
  }

  // Jika bukan string atau kosong, kembalikan 0
  if (
    !value ||
    typeof value !== "string" ||
    value.trim() === "-" ||
    value.trim() === ""
  ) {
    return 0;
  }

  // Hapus semua karakter titik (.) dan koma (,) dari string
  const cleanedString = value.trim().replace(/[.,]/g, "");

  const result = parseFloat(cleanedString);
  return isNaN(result) ? 0 : result;
};

const monthNameToNumber: { [key: string]: number } = {
  januari: 1,
  january: 1,
  jan: 1,
  februari: 2,
  february: 2,
  feb: 2,
  maret: 3,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  mei: 5,
  may: 5,
  juni: 6,
  june: 6,
  jun: 6,
  juli: 7,
  july: 7,
  jul: 7,
  agustus: 8,
  august: 8,
  agu: 8,
  september: 9,
  sept: 9,
  sep: 9,
  oktober: 10,
  october: 10,
  okt: 10,
  november: 11,
  nov: 11,
  desember: 12,
  december: 12,
  des: 12,
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
    const rows: CostExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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
        const companyNameRaw = row.Perusahaan || row.Company;
        const companyName = companyNameRaw?.toString().trim().toLowerCase();
        const companyId = companyName ? companyMap.get(companyName) : undefined;

        const monthInput = row.Month?.toString().trim().toLowerCase();
        const monthNumber = monthInput
          ? monthNameToNumber[monthInput] || Number(monthInput)
          : undefined;

        if (!companyId || !row.Year || !monthNumber) {
          return null;
        }

        return {
          year: Number(row.Year),
          month: monthNumber,
          companyId: companyId,
          managementCost: parseNumber(row["Management Cost"]),
          employeeCost: parseNumber(row["Employee Cost"]),
          recruitment: parseNumber(row.Recruitment),
          secondment: parseNumber(row.Secondment),
          others: parseNumber(row.Others),
          total: parseNumber(row.Total),
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor dari file." },
        { status: 400 }
      );
    }

    const batchSize = 200;
    for (let i = 0; i < dataToUpsert.length; i += batchSize) {
      const batch = dataToUpsert.slice(i, i + batchSize);
      await prisma.$transaction(
        batch.map((data) =>
          prisma.employeeCostStat.upsert({
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
    }

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data Employee Cost berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/employee-cost:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
