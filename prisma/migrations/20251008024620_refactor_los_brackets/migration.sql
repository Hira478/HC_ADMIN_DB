/*
  Warnings:

  - You are about to drop the column `los_0_5_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_0_5_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_11_15_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_11_15_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_16_20_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_16_20_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_21_25_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_21_25_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_25_30_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_25_30_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_6_10_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_6_10_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_over_30_contract` on the `LengthOfServiceStat` table. All the data in the column will be lost.
  - You are about to drop the column `los_over_30_permanent` on the `LengthOfServiceStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LengthOfServiceStat" DROP COLUMN "los_0_5_contract",
DROP COLUMN "los_0_5_permanent",
DROP COLUMN "los_11_15_contract",
DROP COLUMN "los_11_15_permanent",
DROP COLUMN "los_16_20_contract",
DROP COLUMN "los_16_20_permanent",
DROP COLUMN "los_21_25_contract",
DROP COLUMN "los_21_25_permanent",
DROP COLUMN "los_25_30_contract",
DROP COLUMN "los_25_30_permanent",
DROP COLUMN "los_6_10_contract",
DROP COLUMN "los_6_10_permanent",
DROP COLUMN "los_over_30_contract",
DROP COLUMN "los_over_30_permanent",
ADD COLUMN     "los_11_to_15_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_11_to_15_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_16_to_20_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_16_to_20_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_5_to_10_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_5_to_10_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_over_25_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_over_25_permanent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_under_5_contract" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "los_under_5_permanent" INTEGER NOT NULL DEFAULT 0;
