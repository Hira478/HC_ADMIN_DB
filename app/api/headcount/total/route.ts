// app/api/headcount/total/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!companyId || !year || !month) {
    return NextResponse.json(
      { error: "companyId, year, and month are required" },
      { status: 400 }
    );
  }

  try {
    const record = await prisma.headcount.findUnique({
      where: {
        year_month_companyId: {
          year: parseInt(year),
          month: parseInt(month),
          companyId: parseInt(companyId),
        },
      },
    });

    return NextResponse.json({ totalHeadcount: record?.totalCount || 0 });
  } catch (error) {
    console.error("Failed to fetch total headcount:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
