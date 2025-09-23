// File: app/api/uploads/manpower-planning/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk baris Excel, gunakan kutip untuk header dengan spasi
interface ManpowerExcelRow {
  Year: number;
  Month: number | string;
  Company: string;
  "Planned Count": number;
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
    const rows: ManpowerExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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
          plannedCount: Number(row["Planned Count"]) || 0,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

    // Gunakan Batch Processing untuk data dalam jumlah besar
    const batchSize = 200;
    let totalImported = 0;

    for (let i = 0; i < dataToUpsert.length; i += batchSize) {
      const batch = dataToUpsert.slice(i, i + batchSize);

      await prisma.$transaction(
        batch.map((data) =>
          prisma.manpowerPlanning.upsert({
            where: {
              year_month_companyId: {
                year: data.year,
                month: data.month,
                companyId: data.companyId,
              },
            },
            update: { plannedCount: data.plannedCount },
            create: data,
          })
        )
      );
      totalImported += batch.length;
      console.log(
        `Batch MPP ${i / batchSize + 1} selesai, ${totalImported} / ${
          dataToUpsert.length
        } data diproses.`
      );
    }

    return NextResponse.json({
      message: `${totalImported} baris data Manpower Planning berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/manpower-planning:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
