// File: app/api/uploads/rkap/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

interface RkapExcelRow {
  Year: number;
  Company: string;
  Revenue: number;
  "Net Profit": number;
  "Total Employee Cost": number;
}

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
    const rows: RkapExcelRow[] = xlsx.utils.sheet_to_json(sheet);

    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    const companyMap = new Map(
      allCompanies.map((c) => [c.name.toLowerCase(), c.id])
    );

    const processedData = rows.map((row) => {
      const companyName = row.Company?.toString().toLowerCase();
      const companyId = companyMap.get(companyName);

      if (!companyId) {
        console.warn(
          `Perusahaan tidak ditemukan untuk baris: ${row.Company}. Baris dilewati.`
        );
        return null;
      }

      return {
        year: Number(row.Year),
        companyId: companyId,
        revenue: Number(row.Revenue),
        netProfit: Number(row["Net Profit"]),
        totalEmployeeCost: Number(row["Total Employee Cost"]),
      };
    });

    // --- PERBAIKAN DI SINI ---
    // Gunakan 'type guard' untuk meyakinkan TypeScript bahwa 'null' sudah hilang
    const validData = processedData.filter(
      (data): data is NonNullable<typeof data> => data !== null
    );

    if (validData.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data valid yang bisa diimpor." },
        { status: 400 }
      );
    }

    // Sekarang TypeScript tahu bahwa 'data' di dalam map ini tidak mungkin null
    await prisma.$transaction(
      validData.map((data) =>
        prisma.rkapTarget.upsert({
          where: {
            year_companyId: { year: data.year, companyId: data.companyId },
          },
          update: {
            revenue: data.revenue,
            netProfit: data.netProfit,
            totalEmployeeCost: data.totalEmployeeCost,
          },
          create: {
            year: data.year,
            companyId: data.companyId,
            revenue: data.revenue,
            netProfit: data.netProfit,
            totalEmployeeCost: data.totalEmployeeCost,
          },
        })
      )
    );

    return NextResponse.json({
      message: `${validData.length} baris data RKAP berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/rkap:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
