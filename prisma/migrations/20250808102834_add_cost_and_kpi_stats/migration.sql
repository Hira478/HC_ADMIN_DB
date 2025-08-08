-- CreateTable
CREATE TABLE "public"."EmployeeCostStat" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "incentive" DOUBLE PRECISION NOT NULL,
    "pension" DOUBLE PRECISION NOT NULL,
    "others" DOUBLE PRECISION NOT NULL,
    "training_recruitment" DOUBLE PRECISION NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeCostStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KpiStat" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "kpiKorporasi" DOUBLE PRECISION NOT NULL,
    "kpi_hc_transformation" DOUBLE PRECISION NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "KpiStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCostStat_year_month_companyId_key" ON "public"."EmployeeCostStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "KpiStat_year_month_companyId_key" ON "public"."KpiStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."EmployeeCostStat" ADD CONSTRAINT "EmployeeCostStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KpiStat" ADD CONSTRAINT "KpiStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
