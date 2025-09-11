// File: lib/prisma-filter.ts
import { getSession } from "./session";

// Tipe untuk filter Prisma
interface CompanyFilter {
  companyId?: number;
}

/**
 * Fungsi ini mendapatkan sesi user yang sedang login dan
 * mengembalikan filter Prisma yang sesuai berdasarkan role mereka.
 */
export async function getCompanyFilter(): Promise<CompanyFilter> {
  const session = await getSession();

  // Jika tidak ada sesi/user tidak valid, lempar error (keamanan)
  // Blok try-catch di API route akan menangkap ini.
  if (!session) {
    throw new Error("Tidak terautentikasi.");
  }

  // INI LOGIKA UTAMANYA:
  if (session.role === "USER_ANPER") {
    // Jika user adalah Anper, paksa filter berdasarkan companyId mereka
    return { companyId: session.companyId };
  }

  if (session.role === "ADMIN_HOLDING") {
    // Jika user adalah Admin Holding, jangan terapkan filter apa pun
    return {}; // Objek kosong berarti "tampilkan semua"
  }

  // Fallback jika role tidak dikenali (seharusnya tidak terjadi)
  throw new Error("Role pengguna tidak dikenali.");
}
