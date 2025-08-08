import { PrismaClient, AgeStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi sumAgeStats tidak lagi diperlukan dan bisa dihapus
// const sumAgeStats = (stats: AgeStat[]) => { ... };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyIdStr = searchParams.get("companyId");
  const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(searchParams.get("year") || "2025");
  const value = parseInt(searchParams.get("value") || "8");

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Company ID diperlukan dan harus berupa angka." },
      { status: 400 }
    );
  }

  let monthsToFetch: number[] = [];
  if (type === "monthly") {
    monthsToFetch = [value];
  } else if (type === "quarterly") {
    const quarterMonths = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ];
    monthsToFetch = quarterMonths[value - 1] || [];
  } else if (type === "semesterly") {
    const semesterMonths = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12],
    ];
    monthsToFetch = semesterMonths[value - 1] || [];
  } else if (type === "yearly") {
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  }

  try {
    const ageDataFromDb = await prisma.ageStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: {
        month: "asc", // Urutkan untuk memastikan data terakhir adalah yang benar
      },
    });

    if (ageDataFromDb.length === 0) {
      // Jika tidak ada data sama sekali, kembalikan nilai nol
      return NextResponse.json({
        labels: [">50", "41-50", "26-40", "<25"],
        values: [0, 0, 0, 0],
      });
    }

    // <<< MULAI PERUBAHAN LOGIKA DI SINI >>>
    let dataForPeriod: AgeStat | undefined;

    if (type === "monthly") {
      // Untuk bulanan, langsung ambil data pertama (dan satu-satunya)
      dataForPeriod = ageDataFromDb[0];
    } else {
      // Untuk kuartal/semester/tahunan, cari data bulan terakhir
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = ageDataFromDb.find((stat) => stat.month === latestMonth);
    }

    // Jika data untuk bulan terakhir tidak ditemukan (misal: data Maret belum diinput untuk Q1)
    if (!dataForPeriod) {
      return NextResponse.json({
        labels: [">50", "41-50", "26-40", "<25"],
        values: [0, 0, 0, 0],
        message: `Data demografi untuk bulan terakhir (${Math.max(
          ...monthsToFetch
        )}) tidak ditemukan.`,
      });
    }
    // <<< AKHIR PERUBAHAN LOGIKA >>>

    const labels = [">50", "41-50", "26-40", "<25"];
    // <<< GUNAKAN 'dataForPeriod' BUKAN 'aggregatedData' >>>
    const values = [
      dataForPeriod.over50Count,
      dataForPeriod.age41to50Count,
      dataForPeriod.age26to40Count,
      dataForPeriod.under25Count,
    ];

    return NextResponse.json({ labels, values });
  } catch (error) {
    console.error("API Error in /age:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data usia." },
      { status: 500 }
    );
  }
}
