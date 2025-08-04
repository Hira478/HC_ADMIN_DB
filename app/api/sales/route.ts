// app/api/sales/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sales = await prisma.salesData.findMany({
      orderBy: {
        createdAt: "asc", // Urutkan berdasarkan waktu pembuatan
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data penjualan" },
      { status: 500 }
    );
  }
}
