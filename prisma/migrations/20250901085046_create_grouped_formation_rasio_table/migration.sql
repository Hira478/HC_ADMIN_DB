-- CreateTable
CREATE TABLE "public"."FormationRasioGroupedStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "strategy" INTEGER NOT NULL DEFAULT 0,
    "business" INTEGER NOT NULL DEFAULT 0,
    "finance" INTEGER NOT NULL DEFAULT 0,
    "hc_ga" INTEGER NOT NULL DEFAULT 0,
    "operation" INTEGER NOT NULL DEFAULT 0,
    "compliance" INTEGER NOT NULL DEFAULT 0,
    "it" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormationRasioGroupedStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormationRasioGroupedStat_year_month_companyId_key" ON "public"."FormationRasioGroupedStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."FormationRasioGroupedStat" ADD CONSTRAINT "FormationRasioGroupedStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
