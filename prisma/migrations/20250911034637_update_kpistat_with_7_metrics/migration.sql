/*
  Warnings:

  - You are about to drop the column `kpiKorporasi` on the `KpiStat` table. All the data in the column will be lost.
  - You are about to drop the column `kpi_hc_transformation` on the `KpiStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."KpiStat" DROP COLUMN "kpiKorporasi",
DROP COLUMN "kpi_hc_transformation",
ADD COLUMN     "kpiFinansial" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpiOperasional" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpiSosial" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpi_inovasi_bisnis" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpi_kepemimpinan_teknologi" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpi_pengembangan_talenta" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kpi_peningkatan_investasi" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
