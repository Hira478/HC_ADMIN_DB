// File: app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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

    // Cek apakah companyId valid (ada di DB)
    const companyExists = await prisma.company.findUnique({
      where: { id: Number(companyId) },
    });
    if (!companyExists) {
      return NextResponse.json(
        { error: "Perusahaan tidak valid." },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId: Number(companyId),
        // Anda bisa tambahkan logika untuk Role di sini jika perlu
      },
    });

    // Jangan kirim balik password hash di response
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
