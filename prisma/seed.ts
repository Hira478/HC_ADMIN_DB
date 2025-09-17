// prisma/seed.ts

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log(`Mulai proses seeding...`);

  // Ganti detail ini dengan data super admin Anda
  const superAdminEmail = "superadmin@holding.com";
  const superAdminPassword = "PasswordSuperAdminYangKuat!"; // Ganti dengan password yang aman
  const superAdminName = "Super Admin Holding";

  // 1. Cari perusahaan Holding. Ganti "IFG" dengan nama perusahaan Holding Anda yang ada di DB.
  const holdingCompany = await prisma.company.findUnique({
    where: { name: "IFG" }, // PASTIKAN NAMA INI SESUAI DENGAN DI DATABASE ANDA
  });

  if (!holdingCompany) {
    console.error(
      "Perusahaan Holding tidak ditemukan. Pastikan nama perusahaan sudah benar."
    );
    return;
  }

  // 2. Hash password super admin
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // 3. Buat atau update user SUPER_ADMIN menggunakan upsert
  // Upsert akan membuat user jika belum ada, atau mengupdatenya jika sudah ada (berdasarkan email)
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      // Jika user sudah ada, Anda bisa update datanya di sini jika perlu
      password: hashedPassword,
    },
    create: {
      email: superAdminEmail,
      name: superAdminName,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN, // <-- Menetapkan role sebagai SUPER_ADMIN
      companyId: holdingCompany.id,
    },
  });

  console.log(`User Super Admin telah dibuat/diupdate: ${superAdmin.email}`);
  console.log(`Seeding selesai.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
