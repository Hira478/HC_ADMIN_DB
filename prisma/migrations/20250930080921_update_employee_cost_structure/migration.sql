/*
  Warnings:

  - You are about to drop the column `incentive` on the `EmployeeCostStat` table. All the data in the column will be lost.
  - You are about to drop the column `pension` on the `EmployeeCostStat` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `EmployeeCostStat` table. All the data in the column will be lost.
  - You are about to drop the column `training_recruitment` on the `EmployeeCostStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EmployeeCostStat" DROP COLUMN "incentive",
DROP COLUMN "pension",
DROP COLUMN "salary",
DROP COLUMN "training_recruitment",
ADD COLUMN     "employee_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "management_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "recruitment" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "secondment" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "others" SET DEFAULT 0;
