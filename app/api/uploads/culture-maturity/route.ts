// File: app/api/uploads/culture-maturity/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk baris Excel
interface CultureExcelRow {
  Year: number;
  Company: string;
  Amanah: string | number;
  Kompeten: string | number;
  Harmonis: string | number;
  Loyal: string | number;
  Adaptif: string | number;
  Kolaboratif: string | number;
}

// Helper untuk mengubah string "78,2" menjadi angka 78.2
const parseDecimal = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    return parseFloat(value.replace(",", ".")) || 0;
  }
  return 0;
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
    const rows: CultureExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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

        if (!companyId || !row.Year) {
          console.warn(
            `Data tidak lengkap atau perusahaan tidak valid. Baris dilewati:`,
            row
          );
          return null;
        }

        const amanah = parseDecimal(row.Amanah);
        const kompeten = parseDecimal(row.Kompeten);
        const harmonis = parseDecimal(row.Harmonis);
        const loyal = parseDecimal(row.Loyal);
        const adaptif = parseDecimal(row.Adaptif);
        const kolaboratif = parseDecimal(row.Kolaboratif);

        // Hitung ulang totalScore (rata-rata dari 6 nilai)
        const totalScore =
          (amanah + kompeten + harmonis + loyal + adaptif + kolaboratif) / 6;

        return {
          year: Number(row.Year),
          companyId: companyId,
          amanah,
          kompeten,
          harmonis,
          loyal,
          adaptif,
          kolaboratif,
          totalScore,
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
        prisma.cultureMaturityStat.upsert({
          where: {
            year_companyId: { year: data.year, companyId: data.companyId },
          },
          update: {
            amanah: data.amanah,
            kompeten: data.kompeten,
            harmonis: data.harmonis,
            loyal: data.loyal,
            adaptif: data.adaptif,
            kolaboratif: data.kolaboratif,
            totalScore: data.totalScore,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data Culture Maturity berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/culture-maturity:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
