// File: app/api/charts/employee-status/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter";

// --- PERBAIKAN DI FUNGSI INI ---
const calculateYoY = (current: number, previous: number): number => {
  // Jika data tahun lalu TIDAK ADA, ATAU data tahun ini KOSONG,
  // maka anggap tidak ada perubahan (YoY = 0%).
  if (previous === 0 || current === 0) {
    return 0;
  }
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

const formatYoYString = (percentage: number): string => {
  // Tambahkan pengecekan agar 0% tidak menjadi "+0.0%"
  if (percentage === 0) {
    return "0.0% | Year on Year";
  }
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "monthly";
  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );
  const previousYear = currentYear - 1;

  let monthsToFetch: number[] = [];
  if (type === "monthly") {
    monthsToFetch = [value];
  } else if (type === "yearly") {
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  }
  // Anda bisa tambahkan logika lain untuk quarterly/semesterly jika perlu

  try {
    const companyFilter = await getCompanyFilter(request);

    const [statusCurrentYear, statusPreviousYear] = await Promise.all([
      prisma.employeeStatusStat.findMany({
        where: {
          year: currentYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
        orderBy: { month: "asc" },
      }),
      prisma.employeeStatusStat.findMany({
        where: {
          year: previousYear,
          month: { in: monthsToFetch },
          ...companyFilter,
        },
        orderBy: { month: "asc" },
      }),
    ]);

    const latestMonth = Math.max(...monthsToFetch);
    const dataCurrent = statusCurrentYear.find((s) => s.month === latestMonth);
    const dataPrevious = statusPreviousYear.find(
      (s) => s.month === latestMonth
    );

    const permanentCurrent = dataCurrent?.permanentCount ?? 0;
    const contractCurrent = dataCurrent?.contractCount ?? 0;
    const permanentPrevious = dataPrevious?.permanentCount ?? 0;
    const contractPrevious = dataPrevious?.contractCount ?? 0;

    const yoyPermanent = calculateYoY(permanentCurrent, permanentPrevious);
    const yoyContract = calculateYoY(contractCurrent, contractPrevious);

    const response = {
      chartData: [
        { name: "Permanent", value: permanentCurrent },
        { name: "Contract", value: contractCurrent },
      ],
      yoy: {
        permanent: formatYoYString(yoyPermanent),
        contract: formatYoYString(yoyContract),
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /status:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status." },
      { status: 500 }
    );
  }
}
