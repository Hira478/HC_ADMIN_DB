// File: app/api/admin/companies/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// --- GET: Mengambil semua data perusahaan ---
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("API Error GET /api/admin/companies:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data perusahaan." },
      { status: 500 }
    );
  }
}

// --- POST: Membuat perusahaan baru ---
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nama dan Tipe perusahaan wajib diisi." },
        { status: 400 }
      );
    }

    // Cek duplikasi nama
    const existingCompany = await prisma.company.findUnique({
      where: { name },
    });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Nama perusahaan sudah ada." },
        { status: 409 }
      );
    }

    const newCompany = await prisma.company.create({
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error("API Error POST /api/admin/companies:", error);
    return NextResponse.json(
      { error: "Gagal membuat perusahaan." },
      { status: 500 }
    );
  }
}
