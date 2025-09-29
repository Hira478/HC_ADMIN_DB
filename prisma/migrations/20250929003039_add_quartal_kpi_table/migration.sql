-- CreateTable
CREATE TABLE "public"."QuartalKpi" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "kpi_name" TEXT NOT NULL,
    "kpi_category" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "achievement_score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuartalKpi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuartalKpi_year_quarter_companyId_kpi_name_key" ON "public"."QuartalKpi"("year", "quarter", "companyId", "kpi_name");

-- AddForeignKey
ALTER TABLE "public"."QuartalKpi" ADD CONSTRAINT "QuartalKpi_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
