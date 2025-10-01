// File: app/api/uploads/divDeptCount/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx";

interface DivDeptCountExcelRow {
  Year: number;
  Company: string;
  "Total Divisi": number;
  "Total Departemen": number;
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
    const rows: DivDeptCountExcelRow[] = xlsx.utils.sheet_to_json(sheet, {
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
            `Data tidak lengkap atau perusahaan tidak ditemukan. Baris dilewati:`,
            row
          );
          return null;
        }

        return {
          year: Number(row.Year),
          companyId: companyId,
          divisionCount: Number(row["Total Divisi"]) || 0,
          departmentCount: Number(row["Total Departemen"]) || 0,
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
        prisma.organizationStructureStat.upsert({
          where: {
            year_companyId: {
              year: data.year,
              companyId: data.companyId,
            },
          },
          update: {
            divisionCount: data.divisionCount,
            departmentCount: data.departmentCount,
          },
          // ✅ PENYESUAIAN DI SINI
          create: {
            year: data.year,
            companyId: data.companyId,
            divisionCount: data.divisionCount,
            departmentCount: data.departmentCount,
            // Memberikan nilai default 0 untuk semua field wajib lainnya
            risikoTataKelola: 0,
            sdmUmum: 0,
            keuangan: 0,
            it: 0,
            operasional: 0,
            bisnis: 0,
            cabang: 0,
            enablerCount: 0,
            revenueGeneratorCount: 0,
            avgSpanDepartment: 0,
            avgSpanEmployee: 0,
          },
        })
      )
    );

    return NextResponse.json({
      message: `${dataToUpsert.length} baris data Divisi & Departemen berhasil diimpor.`,
    });
  } catch (error) {
    console.error("API Error in /uploads/divDeptCount:", error);
    return NextResponse.json(
      { error: "Gagal memproses file." },
      { status: 500 }
    );
  }
}
