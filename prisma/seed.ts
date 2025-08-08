import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding companies only...");

  // 1. Hapus semua data lama dari semua tabel
  // Urutan penting: hapus data metrik dulu (yang bergantung pada company), baru company.
  await prisma.lengthOfServiceStat.deleteMany({});
  await prisma.ageStat.deleteMany({});
  await prisma.levelStat.deleteMany({});
  await prisma.educationStat.deleteMany({});
  await prisma.employeeStatusStat.deleteMany({});
  await prisma.headcount.deleteMany({});
  await prisma.productivityStat.deleteMany({});
  await prisma.company.deleteMany({});
  console.log("Old data deleted.");

  // 2. Buat HANYA data perusahaan
  const companiesToCreate = [
    { name: "IFG", type: "Holding" },
    { name: "Anper Jaya Abadi", type: "Anper" },
    { name: "Anper Bintang Terang", type: "Anper" },
    { name: "PT Jaminan Kredit Indonesia", type: "Anper" },
    { name: "PT Asuransi Kredit Indonesia", type: "Anper" },
    { name: "PT Asuransi Jasa Indonesia", type: "Anper" },
    { name: "PT Asuransi Jiwa IFG Life", type: "Anper" },
    { name: "Anper Garda Utama", type: "Anper" },
    { name: "Anper Harapan Bangsa", type: "Anper" },
    { name: "Anper Inti Makmur", type: "Anper" },
    { name: "Anper Jasa Prima", type: "Anper" },
  ];

  // Gunakan loop dan create untuk memastikan ID autoincrement berfungsi baik
  console.log("Creating companies...");
  for (const companyData of companiesToCreate) {
    await prisma.company.create({
      data: companyData,
    });
  }

  const allCompanies = await prisma.company.findMany();
  console.log(`${allCompanies.length} companies created.`);
  console.log(
    "Seeding finished successfully. Only company data was seeded. 🌱"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
