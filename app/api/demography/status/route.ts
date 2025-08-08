import { PrismaClient, EmployeeStatusStat } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Fungsi ini tidak lagi digunakan, bisa dihapus
// const sumStatusStats = (stats: EmployeeStatusStat[]) => { ... };

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
    const statusDataFromDb = await prisma.employeeStatusStat.findMany({
      where: { companyId, year, month: { in: monthsToFetch } },
      orderBy: {
        month: "asc",
      },
    });

    // Siapkan data default jika tidak ada data yang ditemukan
    const defaultDataForChart = [
      {
        name: "Permanent",
        value: 0,
        itemStyle: { color: "#C53030" },
        label: { show: false },
      },
      {
        name: "Contract",
        value: 0,
        itemStyle: { color: "#4A5568" },
        label: { show: false },
      },
    ];

    if (statusDataFromDb.length === 0) {
      return NextResponse.json(defaultDataForChart);
    }

    // <<< MULAI LOGIKA BARU UNTUK MEMILIH DATA >>>
    let dataForPeriod: EmployeeStatusStat | undefined;

    if (type === "monthly") {
      dataForPeriod = statusDataFromDb[0];
    } else {
      const latestMonth = Math.max(...monthsToFetch);
      dataForPeriod = statusDataFromDb.find(
        (stat) => stat.month === latestMonth
      );
    }

    if (!dataForPeriod) {
      // Jika data bulan terakhir tidak ada, kembalikan data default
      return NextResponse.json(defaultDataForChart);
    }
    // <<< AKHIR LOGIKA BARU >>>

    // <<< GUNAKAN 'dataForPeriod' UNTUK MENGISI DATA CHART >>>
    const dataForChart = [
      {
        name: "Permanent",
        value: dataForPeriod.permanentCount,
        itemStyle: { color: "#C53030" },
      },
      {
        name: "Contract",
        value: dataForPeriod.contractCount,
        itemStyle: { color: "#4A5568" },
      },
    ];

    return NextResponse.json(dataForChart);
  } catch (error) {
    console.error("API Error in /status:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status." },
      { status: 500 }
    );
  }
}
