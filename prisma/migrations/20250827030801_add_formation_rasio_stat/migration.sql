-- CreateTable
CREATE TABLE "public"."FormationRasioStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "research_development" INTEGER NOT NULL DEFAULT 0,
    "business" INTEGER NOT NULL DEFAULT 0,
    "finance" INTEGER NOT NULL DEFAULT 0,
    "human_resources" INTEGER NOT NULL DEFAULT 0,
    "actuary" INTEGER NOT NULL DEFAULT 0,
    "compliance" INTEGER NOT NULL DEFAULT 0,
    "legal" INTEGER NOT NULL DEFAULT 0,
    "information_technology" INTEGER NOT NULL DEFAULT 0,
    "corporate_secretary" INTEGER NOT NULL DEFAULT 0,
    "general_affairs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormationRasioStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormationRasioStat_year_month_companyId_key" ON "public"."FormationRasioStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."FormationRasioStat" ADD CONSTRAINT "FormationRasioStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
