/*
  Warnings:

  - You are about to drop the column `age_26_40_count` on the `AgeStat` table. All the data in the column will be lost.
  - You are about to drop the column `age_41_50_count` on the `AgeStat` table. All the data in the column will be lost.
  - You are about to drop the column `over_50_count` on the `AgeStat` table. All the data in the column will be lost.
  - You are about to drop the column `under_25_count` on the `AgeStat` table. All the data in the column will be lost.
  - You are about to drop the column `d3_count` on the `EducationStat` table. All the data in the column will be lost.
  - You are about to drop the column `s1_count` on the `EducationStat` table. All the data in the column will be lost.
  - You are about to drop the column `s2_count` on the `EducationStat` table. All the data in the column will be lost.
  - You are about to drop the column `s3_count` on the `EducationStat` table. All the data in the column will be lost.
  - You are about to drop the column `sma_smk_count` on the `EducationStat` table. All the data in the column will be lost.
  - You are about to drop the column `femaleCount` on the `Headcount` table. All the data in the column will be lost.
  - You are about to drop the column `maleCount` on the `Headcount` table. All the data in the column will be lost.
  - You are about to drop the column `los_0_5_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_11_15_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_16_20_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_21_25_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_25_30_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_6_10_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_over_30_count` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `bod1_count` on the `LevelStat` table. All the data in the column will be lost.
  - You are about to drop the column `bod2_count` on the `LevelStat` table. All the data in the column will be lost.
  - You are about to drop the column `bod3_count` on the `LevelStat` table. All the data in the column will be lost.
  - You are about to drop the column `bod4_count` on the `LevelStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AgeStat" DROP COLUMN "age_26_40_count",
DROP COLUMN "age_41_50_count",
DROP COLUMN "over_50_count",
DROP COLUMN "under_25_count";

-- AlterTable
ALTER TABLE "public"."EducationStat" DROP COLUMN "d3_count",
DROP COLUMN "s1_count",
DROP COLUMN "s2_count",
DROP COLUMN "s3_count",
DROP COLUMN "sma_smk_count";

-- AlterTable
ALTER TABLE "public"."Headcount" DROP COLUMN "femaleCount",
DROP COLUMN "maleCount";

-- AlterTable
ALTER TABLE "public"."LengthOfServiceStat" DROP COLUMN "los_0_5_count",
DROP COLUMN "los_11_15_count",
DROP COLUMN "los_16_20_count",
DROP COLUMN "los_21_25_count",
DROP COLUMN "los_25_30_count",
DROP COLUMN "los_6_10_count",
DROP COLUMN "los_over_30_count";

-- AlterTable
ALTER TABLE "public"."LevelStat" DROP COLUMN "bod1_count",
DROP COLUMN "bod2_count",
DROP COLUMN "bod3_count",
DROP COLUMN "bod4_count";
