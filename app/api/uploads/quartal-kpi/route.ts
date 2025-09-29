import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface disesuaikan dengan header Excel
interface QuartalKpiExcelRow {
  No?: number; // Tambahkan No agar bisa dilog
  Tahun: number;
  Perusahaan: string;
  Quartal: string;
  KPI: string;
  Kategori: string;
  Bobot: string | number;
  "Skor Capaian": string | number;
}

// Helper functions (tidak berubah)
const parsePercentage = (value: string | number | undefined): number | null => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
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

    // --- CONSOLE LOG 1: Cek jumlah total baris ---
    console.log(
      `[PROSES DIMULAI] Ditemukan ${rows.length} baris di file Excel.`
    );

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.trim().toLowerCase(), c.id])
    );

    let skippedCount = 0;

    const dataToUpsert = rows
      .map((row, index) => {
        const validationErrors: string[] = [];

        // Validasi setiap kolom secara terpisah
        const companyName = row.Perusahaan?.toString().trim().toLowerCase();
        const companyId = companyMap.get(companyName);
        if (!companyId) {
          validationErrors.push(
            `Perusahaan tidak ditemukan: '${row.Perusahaan}'`
          );
        }

        if (!row.Tahun || isNaN(Number(row.Tahun))) {
          validationErrors.push(`Tahun tidak valid: '${row.Tahun}'`);
        }

        const quarter = parseQuarter(row.Quartal);
        if (quarter === null) {
          validationErrors.push(`Format Kuartal salah: '${row.Quartal}'`);
        }

        if (!row.KPI || String(row.KPI).trim() === "") {
          validationErrors.push(`Nama KPI kosong`);
        }

        const weight = parsePercentage(row.Bobot);
        if (weight === null) {
          validationErrors.push(`Format Bobot salah: '${row.Bobot}'`);
        }

        const achievementScore = parsePercentage(row["Skor Capaian"]);
        if (achievementScore === null) {
          validationErrors.push(
            `Format Skor Capaian salah: '${row["Skor Capaian"]}'`
          );
        }

        // --- CONSOLE LOG 2: Jika ada error, tampilkan detailnya ---
        if (validationErrors.length > 0) {
          skippedCount++;
          // Menggunakan `index + 2` untuk mencerminkan nomor baris aktual di Excel (asumsi header di baris 1)
          console.warn(
            `[BARIS DILEWATI] Baris Excel #${index + 2} (No: ${
              row.No || "N/A"
            }) Gagal validasi - Alasan: ${validationErrors.join(", ")}.`
          );
          return null;
        }

        return {
          year: Number(row.Tahun),
          quarter: quarter!,
          companyId: companyId!,
          kpiName: String(row.KPI).trim(),
          kpiCategory: row.Kategori,
          weight: weight!,
          achievementScore: achievementScore!,
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    // --- CONSOLE LOG 3: Ringkasan hasil proses ---
    console.log(
      `[PROSES SELESAI] ${dataToUpsert.length} baris valid akan diimpor. ${skippedCount} baris dilewati.`
    );

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
