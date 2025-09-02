// app/api/companies/route.ts

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error("API Error in /companies:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar perusahaan." },
      { status: 500 }
    );
  }
}
