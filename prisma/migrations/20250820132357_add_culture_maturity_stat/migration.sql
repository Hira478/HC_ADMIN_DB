-- CreateTable
CREATE TABLE "public"."CultureMaturityStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "amanah" DOUBLE PRECISION NOT NULL,
    "kompeten" DOUBLE PRECISION NOT NULL,
    "harmonis" DOUBLE PRECISION NOT NULL,
    "loyal" DOUBLE PRECISION NOT NULL,
    "adaptif" DOUBLE PRECISION NOT NULL,
    "kolaboratif" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CultureMaturityStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CultureMaturityStat_year_companyId_key" ON "public"."CultureMaturityStat"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."CultureMaturityStat" ADD CONSTRAINT "CultureMaturityStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
