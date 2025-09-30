import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk mendefinisikan struktur baris dari file Excel
interface DivisionExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  "Division Name": string;
  Kategori: string;
  "Planned Count": number;
  "Actual Count": number;
}

// "Kamus" untuk menerjemahkan nama bulan ke angka
const monthNameToNumber: { [key: string]: number } = {
  januari: 1,
  january: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
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

// Fungsi pembersih nama perusahaan untuk pencocokan yang lebih baik
const sanitizeCompanyName = (name: string): string => {
  if (!name) return "";
  return name.toString().replace(/\s+/g, " ").trim().toLowerCase();
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
    const rows: DivisionExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
    });

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [sanitizeCompanyName(c.name), c.id])
    );

    const dataToUpsert = rows
      .map((row) => {
        const companyName = sanitizeCompanyName(row.Company);
        const companyId = companyMap.get(companyName);
        const monthInput = row.Month?.toString().trim().toLowerCase();
        const monthNumber = monthInput
          ? monthNameToNumber[monthInput] || Number(monthInput)
          : undefined;

        if (!companyId || !row.Year || !monthNumber || !row["Division Name"]) {
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
          divisionName: row["Division Name"],
          Kategori: row.Kategori || "Umum",
          plannedCount: Number(row["Planned Count"]) || 0,
          actualCount: Number(row["Actual Count"]) || 0,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

    // Batch Processing untuk menangani data dalam jumlah besar
    const batchSize = 200;
    let totalImported = 0;

    for (let i = 0; i < dataToUpsert.length; i += batchSize) {
      const batch = dataToUpsert.slice(i, i + batchSize);

      await prisma.$transaction(
        batch.map((data) =>
          prisma.divisionStat.upsert({
            where: {
              year_month_companyId_divisionName: {
                year: data.year,
                month: data.month,
                companyId: data.companyId,
                divisionName: data.divisionName,
              },
            },
            update: {
              Kategori: data.Kategori,
              plannedCount: data.plannedCount,
              actualCount: data.actualCount,
            },
            create: data,
          })
        )
      );
      totalImported += batch.length;
      console.log(
        `Batch Divisi ${i / batchSize + 1} selesai, ${totalImported} / ${
          dataToUpsert.length
        } data diproses.`
      );
    }

    return NextResponse.json({
      message: `${totalImported} baris data divisi berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/division-stat:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
