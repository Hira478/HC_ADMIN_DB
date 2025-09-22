// File: app/api/uploads/hcma-score/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk baris Excel, gunakan kutip untuk header dengan spasi
interface HcmaExcelRow {
  Year: number;
  Company: string;
  "Talent Succession": string | number;
  "Reward Recognition": string | number;
  "Learning Development": string | number;
  "Performance Goal": string | number;
  "Capacity Strategy": string | number;
  "Behaviour Culture": string | number;
  "Human Capital IT": string | number;
  Leadership: string | number;
  "IFG Average Score": string | number;
}

// Helper untuk mengubah string "2,75" menjadi angka 2.75
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
    const rows: HcmaExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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

        // Parse semua 8 pilar skor
        const pilar1 = parseDecimal(row["Talent Succession"]);
        const pilar2 = parseDecimal(row["Reward Recognition"]);
        const pilar3 = parseDecimal(row["Learning Development"]);
        const pilar4 = parseDecimal(row["Performance Goal"]);
        const pilar5 = parseDecimal(row["Capacity Strategy"]);
        const pilar6 = parseDecimal(row["Behaviour Culture"]);
        const pilar7 = parseDecimal(row["Human Capital IT"]);
        const pilar8 = parseDecimal(row.Leadership);

        // Hitung ulang Total Score sebagai rata-rata dari 8 pilar
        const totalScore =
          (pilar1 +
            pilar2 +
            pilar3 +
            pilar4 +
            pilar5 +
            pilar6 +
            pilar7 +
            pilar8) /
          8;

        // Ambil IFG Average Score "as is"
        const ifgAverageScore = parseDecimal(row["IFG Average Score"]);

        return {
          year: Number(row.Year),
          companyId: companyId,
          talentSuccession: pilar1,
          rewardRecognition: pilar2,
          learningDevelopment: pilar3,
          performanceGoal: pilar4,
          capacityStrategy: pilar5,
          behaviourCulture: pilar6,
          humanCapitalIt: pilar7,
          leadership: pilar8,
          totalScore: totalScore,
          ifgAverageScore: ifgAverageScore,
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
        prisma.hcmaScore.upsert({
          where: {
            year_companyId: { year: data.year, companyId: data.companyId },
          },
          update: data, // Kirim semua data untuk diupdate
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data HCMA Score berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/hcma-score:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
