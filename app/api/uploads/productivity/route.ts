import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Tipe untuk baris Excel, properti bulan bisa string atau number
interface ExcelRow {
  Year: number;
  Month?: number | string; // Diperbarui agar bisa menerima string
  Bulan?: number | string; // Diperbarui agar bisa menerima string
  Perusahaan: string;
  Revenue: number;
  "Net Profit": number;
  "Total Employee Cost": number;
  "Total Cost": number;
}

// --- 1. TAMBAHKAN "KAMUS" UNTUK MENERJEMAHKAN BULAN ---
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
    const rows: ExcelRow[] = xlsx.utils.sheet_to_json(sheet);

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    const dataToUpsert = rows
      .map((row) => {
        const companyName = row.Perusahaan?.toString().trim().toLowerCase();
        const companyId = companyMap.get(companyName);

        // --- 2. LOGIKA BARU UNTUK MENGUBAH NAMA BULAN MENJADI ANGKA ---
        const monthInput = (row.Month || row.Bulan)
          ?.toString()
          .trim()
          .toLowerCase();
        const monthNumber = monthInput
          ? monthNameToNumber[monthInput]
          : undefined;

        if (!companyId || !row.Year || !monthNumber) {
          console.warn(
            `Data tidak lengkap, perusahaan, atau bulan tidak valid. Baris dilewati:`,
            row
          );
          return null;
        }

        return {
          year: Number(row.Year),
          month: monthNumber, // <-- Gunakan angka hasil konversi
          companyId: companyId,
          revenue: Number(row.Revenue) || 0,
          netProfit: Number(row["Net Profit"]) || 0,
          totalEmployeeCost: Number(row["Total Employee Cost"]) || 0,
          totalCost: Number(row["Total Cost"]) || 0,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor dari file." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.productivityStat.upsert({
          where: {
            year_month_companyId: {
              year: data.year,
              month: data.month,
              companyId: data.companyId,
            },
          },
          update: {
            revenue: data.revenue,
            netProfit: data.netProfit,
            totalEmployeeCost: data.totalEmployeeCost,
            totalCost: data.totalCost,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data produktivitas berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/productivity:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
