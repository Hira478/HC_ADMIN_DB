// File: app/api/filters/available-periods/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyIdFromQuery = parseInt(searchParams.get("companyId") || "");

    // Tentukan companyId mana yang akan digunakan untuk filter
    let targetCompanyId: number;
    if (session.role === "USER_ANPER") {
      // Jika user anper, paksa gunakan companyId dari sesi mereka
      targetCompanyId = session.companyId;
    } else if (
      session.role === "ADMIN_HOLDING" ||
      session.role === "SUPER_ADMIN"
    ) {
      // Jika admin, gunakan companyId dari query. Jika tidak ada, jangan filter (opsional)
      // Namun, karena frontend akan selalu mengirimnya, kita utamakan dari query.
      if (!companyIdFromQuery) {
        // Seharusnya tidak terjadi, tapi sebagai fallback, kirim array kosong.
        return NextResponse.json([]);
      }
      targetCompanyId = companyIdFromQuery;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const availablePeriods = await prisma.headcount.findMany({
      where: {
        companyId: targetCompanyId, // <-- FILTER BERDASARKAN COMPANY ID
      },
      select: {
        year: true,
        month: true,
      },
      distinct: ["year", "month"],
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(availablePeriods);
  } catch (error) {
    console.error("API Error in /available-periods:", error);
    return NextResponse.json({ error: "Fail to fetch data." }, { status: 500 });
  }
}
