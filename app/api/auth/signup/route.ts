// File: app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client"; // <-- 1. Import Enum UserRole

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, companyId } = body;

    if (!email || !name || !password || !companyId) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // --- LOGIKA BARU DIMULAI DI SINI ---

    // 2. Ambil detail perusahaan yang dipilih untuk mengecek tipenya
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Perusahaan tidak valid." },
        { status: 400 }
      );
    }

    // 3. Tentukan role user berdasarkan tipe perusahaan
    const userRole: UserRole =
      company.type === "Holding" ? UserRole.ADMIN_HOLDING : UserRole.USER_ANPER;

    // --- AKHIR LOGIKA BARU ---

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat user baru dengan role yang sudah ditentukan secara dinamis
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId: Number(companyId),
        role: userRole, // <-- Gunakan role yang dinamis, bukan default
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
