import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// DIUBAH: Interface disesuaikan dengan header Excel ("Tahun")
interface QuartalKpiExcelRow {
  Tahun: number; // Sebelumnya "Year"
  Perusahaan: string;
  Quartal: string;
  KPI: string;
  Kategori: string;
  Bobot: string | number; // Bisa string "6%" atau number 0.06
  "Skor Capaian": string | number;
}

// DIUBAH: Helper function diperbarui untuk menangani angka langsung
const parsePercentage = (value: string | number | undefined): number | null => {
  if (typeof value === "number") {
    // Jika sudah angka, asumsikan itu adalah format desimal yang benar (misal: 0.06)
    // dan langsung kembalikan nilainya.
    return value;
  }
  if (typeof value !== "string") return null;

  // Jika string, proses seperti sebelumnya
  const cleanedValue = value.replace(/%/g, "").replace(/,/g, ".").trim();
  const num = parseFloat(cleanedValue);

  return isNaN(num) ? null : num / 100;
};

const parseQuarter = (value: string | undefined): number | null => {
  if (!value || typeof value !== "string") return null;
  const num = parseInt(value.replace(/quartal/i, "").trim());
  return isNaN(num) ? null : num;
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
    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: QuartalKpiExcelRow[] = xlsx.utils.sheet_to_json(sheet);

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

        const quarter = parseQuarter(row.Quartal);
        const weight = parsePercentage(row.Bobot);
        const achievementScore = parsePercentage(row["Skor Capaian"]);

        // DIUBAH: Mengakses "row.Tahun" bukan "row.Year"
        if (
          !companyId ||
          !row.Tahun ||
          !quarter ||
          !row.KPI ||
          weight === null ||
          achievementScore === null
        ) {
          console.warn(
            "Data tidak lengkap atau tidak valid, baris dilewati:",
            row
          );
          return null;
        }

        return {
          year: Number(row.Tahun), // DIUBAH
          quarter: quarter,
          companyId: companyId,
          kpiName: row.KPI,
          kpiCategory: row.Kategori,
          weight: weight,
          achievementScore: achievementScore,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    if (dataToUpsert.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor dari file ini." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      dataToUpsert.map((data) =>
        prisma.quartalKpi.upsert({
          where: {
            year_quarter_companyId_kpiName: {
              year: data.year,
              quarter: data.quarter,
              companyId: data.companyId,
              kpiName: data.kpiName,
            },
          },
          update: {
            kpiCategory: data.kpiCategory,
            weight: data.weight,
            achievementScore: data.achievementScore,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data KPI berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/quartal-kpi:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
