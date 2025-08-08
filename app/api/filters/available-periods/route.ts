import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil semua kombinasi unik dari tahun dan bulan yang ada di tabel Headcount
    // Kita hanya perlu query satu tabel, karena jika ada data headcount, metrik lain juga seharusnya ada.
    const availablePeriods = await prisma.headcount.findMany({
      select: {
        year: true,
        month: true,
      },
      distinct: ["year", "month"],
      orderBy: [{ year: "desc" }, { month: "asc" }],
    });

    return NextResponse.json(availablePeriods);
  } catch (error) {
    console.error("API Error in /available-periods:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data periode tersedia." },
      { status: 500 }
    );
  }
}
