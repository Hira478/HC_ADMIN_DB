// File: app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies dari next/headers
import * as jose from "jose"; // Kita gunakan 'jose' seperti di middleware
import prisma from "@/lib/prisma";

export async function GET() {
  const tokenCookie = (await cookies()).get("auth_token"); // Await cookies() sebelum memanggil .get()

  if (!tokenCookie) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    // 1. Verifikasi token
    const { payload } = await jose.jwtVerify(tokenCookie.value, secret);

    if (!payload.userId) {
      throw new Error("Payload token tidak valid.");
    }

    // 2. Ambil data user DAN perusahaannya dari database
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      include: {
        company: true, // Sertakan data perusahaan yang terelasi
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Kirim data yang aman ke frontend
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name, // Kirim nama perusahaan
    };

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("API /me error:", error);
    // Jika token gagal diverifikasi (kadaluarsa, dll)
    return NextResponse.json(
      { error: "Token tidak valid atau kadaluarsa" },
      { status: 401 }
    );
  }
}
