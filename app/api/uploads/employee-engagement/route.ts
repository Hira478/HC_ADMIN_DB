// File: app/api/uploads/employee-engagement/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

// Interface untuk baris Excel
interface EngagementExcelRow {
  Year: number;
  Company: string;
  Say: string | number;
  Stay: string | number;
  Strive: string | number;
  "Average Score"?: string | number; // Opsional, karena akan kita hitung ulang
}

// Helper untuk mengubah string "80,1" menjadi angka 80.1
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
    const rows: EngagementExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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

        const say = parseDecimal(row.Say);
        const stay = parseDecimal(row.Stay);
        const strive = parseDecimal(row.Strive);

        // Hitung ulang totalScore untuk integritas data
        const totalScore = (say + stay + strive) / 3;

        return {
          year: Number(row.Year),
          companyId: companyId,
          say,
          stay,
          strive,
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
        prisma.employeeEngagementStat.upsert({
          where: {
            year_companyId: { year: data.year, companyId: data.companyId },
          },
          update: {
            say: data.say,
            stay: data.stay,
            strive: data.strive,
            totalScore: data.totalScore,
          },
          create: data,
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data Employee Engagement berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/employee-engagement:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
