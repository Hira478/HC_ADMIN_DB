-- CreateTable
CREATE TABLE "public"."ManpowerPlanning" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "plannedCount" INTEGER NOT NULL,

    CONSTRAINT "ManpowerPlanning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DivisionStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "divisionName" TEXT NOT NULL,
    "plannedCount" INTEGER NOT NULL,
    "actualCount" INTEGER NOT NULL,

    CONSTRAINT "DivisionStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManpowerPlanning_year_month_companyId_key" ON "public"."ManpowerPlanning"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisionStat_year_month_companyId_divisionName_key" ON "public"."DivisionStat"("year", "month", "companyId", "divisionName");

-- AddForeignKey
ALTER TABLE "public"."ManpowerPlanning" ADD CONSTRAINT "ManpowerPlanning_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DivisionStat" ADD CONSTRAINT "DivisionStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
