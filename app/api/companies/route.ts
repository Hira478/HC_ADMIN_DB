// app/api/companies/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
