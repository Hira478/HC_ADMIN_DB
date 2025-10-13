/*
  Warnings:

  - You are about to drop the column `over_50_contract` on the `AgeStat` table. All the data in the column will be lost.
  - You are about to drop the column `over_50_permanent` on the `AgeStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AgeStat" DROP COLUMN "over_50_contract",
DROP COLUMN "over_50_permanent",
ADD COLUMN     "age_51_to_60_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "age_51_to_60_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "over_60_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "over_60_permanent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."LevelStat" ADD COLUMN     "bod5_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bod5_permanent" INTEGER NOT NULL DEFAULT 0;
