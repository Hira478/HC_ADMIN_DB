/*
  Warnings:

  - The primary key for the `EmployeeCostStat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `EmployeeCostStat` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `KpiStat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `KpiStat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."EmployeeCostStat" DROP CONSTRAINT "EmployeeCostStat_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "EmployeeCostStat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."KpiStat" DROP CONSTRAINT "KpiStat_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "KpiStat_pkey" PRIMARY KEY ("id");
