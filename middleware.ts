// File: middleware.ts (di root folder, sejajar dengan app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose"; // jose adalah library JWT modern (ganti jsonwebtoken untuk middleware)

// Anda perlu instal 'jose': npm install jose

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("auth_token");
  const loginUrl = new URL("/login", request.url);

  // 1. Jika tidak ada token, redirect ke login
  if (!tokenCookie) {
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika ada token, verifikasi token tersebut
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    // Verifikasi token menggunakan jose
    await jose.jwtVerify(tokenCookie.value, secret);

    // Jika token valid, lanjutkan ke halaman yang diminta
    return NextResponse.next();
  } catch (error) {
    // 3. Jika token tidak valid (kadaluarsa, tanda tangan salah),
    // redirect ke login dan hapus cookie yang salah.
    console.error("JWT Verification Error:", error);
    const response = NextResponse.redirect(loginUrl);
    // Hapus cookie yang tidak valid
    response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

// 4. Konfigurasi Matcher
// Ini memberi tahu middleware untuk HANYA berjalan pada rute-rute ini.
// Kita melindungi semua rute dashboard, TAPI TIDAK melindungi login, signup, atau API.
export const config = {
  matcher: [
    /*
     * Cocokkan semua rute kecuali:
     * 1. Rute API (/api/)
     * 2. Rute Next.js internal (/_next/)
     * 3. Rute file statis (/favicon.ico, /logo.png, dll.)
     * 4. Halaman login dan signup
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
  ],
};
