// File: lib/session.ts
import { cookies } from "next/headers";
import * as jose from "jose";

// Definisikan tipe untuk payload token kita agar aman
export interface UserPayload {
  userId: number;
  email: string;
  role: "ADMIN_HOLDING" | "USER_ANPER";
  companyId: number;
  iat: number; // Issued At
  exp: number; // Expiration Time
}

export async function getSession(): Promise<UserPayload | null> {
  // --- PERBAIKAN 1 DI SINI ---
  // Tambahkan 'await' pada cookies(), sama seperti di file /api/auth/me
  const tokenCookie = (await cookies()).get("auth_token")?.value;

  if (!tokenCookie) {
    return null; // Tidak ada token, tidak ada sesi
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jose.jwtVerify(tokenCookie, secret);

    // --- PERBAIKAN 2 DI SINI ---
    // Buat objek baru secara eksplisit, jangan casting paksa 'as UserPayload'
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as "ADMIN_HOLDING" | "USER_ANPER",
      companyId: payload.companyId as number,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error("Gagal memverifikasi token sesi:", error);
    return null; // Token tidak valid atau kadaluarsa
  }
}
