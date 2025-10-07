-- AlterTable
ALTER TABLE "public"."EducationStat" ADD COLUMN     "sd_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sd_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smp_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smp_permanent" INTEGER NOT NULL DEFAULT 0;
