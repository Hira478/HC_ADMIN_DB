// File: app/api/auth/logout/route.ts
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Buat cookie yang sudah kadaluarsa (maxAge: -1)
    const cookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1, // Setel agar langsung kadaluarsa
      path: "/",
    });

    return NextResponse.json(
      { message: "Logout berhasil" },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
