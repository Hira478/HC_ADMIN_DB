// File: lib/prisma-filter.ts
import { getSession } from "./session";
import { NextRequest } from "next/server";

interface CompanyFilter {
  companyId?: number;
}

/**
 * Fungsi ini sekarang menerima 'request' untuk bisa membaca URL search params.
 */
export async function getCompanyFilter(
  request: NextRequest
): Promise<CompanyFilter> {
  const session = await getSession();

  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  // LOGIKA UTAMA YANG BARU:
  if (session.role === "USER_ANPER") {
    // 1. Jika user adalah Anper, KUNCI filter ke companyId dari token mereka.
    return { companyId: session.companyId };
  }

  if (session.role === "ADMIN_HOLDING") {
    // 2. Jika user adalah Admin Holding, MEREKA BOLEH MEMFILTER.
    const searchParams = request.nextUrl.searchParams;
    const companyIdFromQuery = searchParams.get("companyId");

    if (companyIdFromQuery) {
      // Jika ada filter companyId di URL, gunakan itu.
      return { companyId: parseInt(companyIdFromQuery) };
    } else {
      // --- PERBAIKAN DI SINI ---
      // Jika TIDAK ada filter di URL, defaultnya adalah melihat data
      // perusahaan MILIK ADMIN HOLDING ITU SENDIRI (dari token).
      return { companyId: session.companyId };
    }
  }

  // Fallback jika role tidak dikenali
  throw new Error("Role pengguna tidak dikenali.");
}
