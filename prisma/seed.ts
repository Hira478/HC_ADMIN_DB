// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- FUNGSI BANTUAN ---

// Mendapatkan angka acak dalam rentang
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Membagi total hitungan ke dalam beberapa bucket secara acak
function distributeCount(total: number, numBuckets: number): number[] {
  if (total === 0) return Array(numBuckets).fill(0);
  let remaining = total;
  const buckets = Array(numBuckets).fill(0);
  for (let i = 0; i < numBuckets - 1; i++) {
    const value = getRandomNumber(0, remaining);
    buckets[i] = value;
    remaining -= value;
  }
  buckets[numBuckets - 1] = remaining; // Bucket terakhir mendapat sisa
  return buckets.sort(() => Math.random() - 0.5); // Acak urutan distribusi
}

async function main() {
  console.log("Start seeding analytic data...");

  // 1. Hapus semua data lama dari tabel-tabel baru
  await prisma.lengthOfServiceStat.deleteMany({});
  await prisma.ageStat.deleteMany({});
  await prisma.levelStat.deleteMany({});
  await prisma.educationStat.deleteMany({});
  await prisma.employeeStatusStat.deleteMany({});
  await prisma.headcount.deleteMany({});
  await prisma.company.deleteMany({});
  console.log("Old analytic data deleted.");

  // 2. Buat data perusahaan
  const companyNames = [
    { name: "Holding Company", type: "Holding" },
    { name: "Anper Jaya Abadi", type: "Anper" },
    { name: "Anper Bintang Terang", type: "Anper" },
    { name: "Anper Cipta Karya", type: "Anper" },
    { name: "Anper Delta Persada", type: "Anper" },
    { name: "Anper Eka Mandiri", type: "Anper" },
    { name: "Anper Fajar Sejati", type: "Anper" },
    { name: "Anper Garda Utama", type: "Anper" },
    { name: "Anper Harapan Bangsa", type: "Anper" },
    { name: "Anper Inti Makmur", type: "Anper" },
    { name: "Anper Jasa Prima", type: "Anper" },
  ];
  await prisma.company.createMany({ data: companyNames });
  const allCompanies = await prisma.company.findMany();
  console.log(`${allCompanies.length} companies created.`);

  // 3. Buat data agregat untuk setiap perusahaan selama 12 bulan terakhir
  console.log("Generating monthly stats for each company...");
  for (const company of allCompanies) {
    for (let i = 0; i < 12; i++) {
      const date = new Date("2025-08-04");
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() 0-11, kita mau 1-12

      // --- Generate data untuk satu periode ---
      const totalHeadcount =
        company.type === "Holding"
          ? getRandomNumber(800, 1200)
          : getRandomNumber(50, 250);

      // Headcount
      const femaleCount = Math.floor(
        (totalHeadcount * getRandomNumber(35, 45)) / 100
      );
      const maleCount = totalHeadcount - femaleCount;
      await prisma.headcount.create({
        data: {
          year,
          month,
          totalCount: totalHeadcount,
          maleCount,
          femaleCount,
          companyId: company.id,
        },
      });

      // Employee Status
      const contractCount = Math.floor(
        (totalHeadcount * getRandomNumber(15, 30)) / 100
      );
      const permanentCount = totalHeadcount - contractCount;
      await prisma.employeeStatusStat.create({
        data: {
          year,
          month,
          permanentCount,
          contractCount,
          companyId: company.id,
        },
      });

      // Education, Level, Age, Length of Service
      const [d3, s1, s2, s3] = distributeCount(totalHeadcount, 4);
      await prisma.educationStat.create({
        data: {
          year,
          month,
          d3Count: d3,
          s1Count: s1,
          s2Count: s2,
          s3Count: s3,
          companyId: company.id,
        },
      });

      const [bod1, bod2, bod3, bod4] = distributeCount(totalHeadcount, 4);
      await prisma.levelStat.create({
        data: {
          year,
          month,
          bod1Count: bod1,
          bod2Count: bod2,
          bod3Count: bod3,
          bod4Count: bod4,
          companyId: company.id,
        },
      });

      const [under25, age26to40, age41to50, over50] = distributeCount(
        totalHeadcount,
        4
      );
      await prisma.ageStat.create({
        data: {
          year,
          month,
          under25Count: under25,
          age26to40Count: age26to40,
          age41to50Count: age41to50,
          over50Count: over50,
          companyId: company.id,
        },
      });

      const [
        los0_5,
        los6_10,
        los11_15,
        los16_20,
        los21_25,
        los25_30,
        losOver30,
      ] = distributeCount(totalHeadcount, 7);
      await prisma.lengthOfServiceStat.create({
        data: {
          year,
          month,
          los_0_5_Count: los0_5,
          los_6_10_Count: los6_10,
          los_11_15_Count: los11_15,
          los_16_20_Count: los16_20,
          los_21_25_Count: los21_25,
          los_25_30_Count: los25_30,
          los_over_30_Count: losOver30,
          companyId: company.id,
        },
      });
    }
  }
  console.log("Monthly stats generation finished.");
  console.log("Seeding finished successfully. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
