import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";

// Fungsi helper untuk menghitung YoY
const calculateYoY = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const denominator = Math.abs(previous);
  return ((current - previous) / denominator) * 100;
};

// Fungsi helper untuk memformat string YoY
const formatYoYString = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% | Year on Year`;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = parseInt(searchParams.get("companyId") || "0");
  const type = searchParams.get("type") || "monthly";
  const currentYear = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || (new Date().getMonth() + 1).toString()
  );
  const previousYear = currentYear - 1;

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID diperlukan." },
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
    const [statusCurrentYear, statusPreviousYear] = await Promise.all([
      prisma.employeeStatusStat.findMany({
        where: { companyId, year: currentYear, month: { in: monthsToFetch } },
        orderBy: { month: "asc" },
      }),
      prisma.employeeStatusStat.findMany({
        where: { companyId, year: previousYear, month: { in: monthsToFetch } },
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
  } catch (error) {
    console.error("API Error in /status:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status." },
      { status: 500 }
    );
  }
}
