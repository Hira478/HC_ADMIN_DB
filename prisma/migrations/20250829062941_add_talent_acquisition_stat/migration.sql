-- CreateTable
CREATE TABLE "public"."TalentAcquisitionStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "newHireCount" INTEGER NOT NULL DEFAULT 0,
    "costOfHire" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TalentAcquisitionStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentAcquisitionStat_year_month_companyId_key" ON "public"."TalentAcquisitionStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."TalentAcquisitionStat" ADD CONSTRAINT "TalentAcquisitionStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
