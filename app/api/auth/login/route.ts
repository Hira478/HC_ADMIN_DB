// File: app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import * as jose from "jose"; // <-- GANTI: Import jose
import { serialize } from "cookie";
// HAPUS: import jwt from "jsonwebtoken"; (sudah tidak dipakai)

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 jam (sesuai update kita sebelumnya)

export async function POST(request: Request) {
  // Pastikan JWT_SECRET ada di .env
  if (!JWT_SECRET) {
    console.error("JWT_SECRET tidak diatur di .env");
    return NextResponse.json(
      { error: "Konfigurasi server bermasalah." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Cari user di database (tidak berubah)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 2. Bandingkan password (tidak berubah)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 3. Buat Payload JWT (tidak berubah)
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      // Penting: jose membutuhkan payload yang "flat"
      // Jika Anda butuh data kompleks, simpan sebagai string JSON
    };

    // --- PERUBAHAN LOGIKA PEMBUATAN TOKEN DIMULAI DI SINI ---

    // 4. Siapkan Kunci Rahasia untuk 'jose'
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const alg = "HS256"; // Algoritma yang kita gunakan (harus sama dengan di middleware)

    // 5. Buat Token JWT menggunakan 'jose'
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg }) // Set header algoritma
      .setIssuedAt() // Set waktu token dibuat
      .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`) // Set waktu kadaluarsa (8 jam)
      .sign(secretKey); // Tanda tangani dengan kunci rahasia

    // --- AKHIR PERUBAHAN LOGIKA ---

    // 6. Buat httpOnly Cookie (tidak berubah)
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: TOKEN_MAX_AGE_SECONDS,
      path: "/",
    });

    // 7. Kirim respons sukses (tidak berubah)
    return NextResponse.json(
      { success: true, message: "Login berhasil." },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
