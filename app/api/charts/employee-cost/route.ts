// File: app/api/charts/employee-cost/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyFilter } from "@/lib/prisma-filter"; // <-- 1. IMPORT HELPER

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "monthly";
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const value = parseInt(
    searchParams.get("value") || new Date().getMonth() + (1).toString()
  );

  let monthsToFetch: number[] = [];
  if (type === "monthly") monthsToFetch = [value];
  else if (type === "yearly")
    monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
  // ... (logika lain untuk quarterly/semesterly bisa ditambahkan di sini)

  try {
    // 2. GUNAKAN FILTER KEAMANAN
    const companyFilter = await getCompanyFilter(request);

    const costData = await prisma.employeeCostStat.findMany({
      where: { year, month: { in: monthsToFetch }, ...companyFilter },
      orderBy: { month: "asc" },
    });

    // --- 3. PERUBAHAN LOGIKA DI SINI ---
    // Jika data kosong, tetap kirim 200 OK, tapi dengan array data kosong
    if (costData.length === 0) {
      return NextResponse.json({
        labels: [],
        series: [],
      });
    }

    const response = {
      labels: costData.map((d) => monthNames[d.month - 1]),
      series: [
        { name: "Salary", data: costData.map((d) => d.salary) },
        { name: "Incentive", data: costData.map((d) => d.incentive) },
        { name: "Pension", data: costData.map((d) => d.pension) },
        {
          name: "Training & Recruitment",
          data: costData.map((d) => d.trainingRecruitment),
        },
        { name: "Others", data: costData.map((d) => d.others) },
      ],
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Tidak terautentikasi.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("API Error in /charts/employee-cost:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}
