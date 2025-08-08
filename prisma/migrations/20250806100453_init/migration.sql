-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Headcount" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "maleCount" INTEGER NOT NULL,
    "femaleCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Headcount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployeeStatusStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "permanentCount" INTEGER NOT NULL,
    "contractCount" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeStatusStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EducationStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "sma_smk_count" INTEGER NOT NULL DEFAULT 0,
    "d3_count" INTEGER NOT NULL,
    "s1_count" INTEGER NOT NULL,
    "s2_count" INTEGER NOT NULL,
    "s3_count" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "EducationStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LevelStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "bod1_count" INTEGER NOT NULL,
    "bod2_count" INTEGER NOT NULL,
    "bod3_count" INTEGER NOT NULL,
    "bod4_count" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "LevelStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgeStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "under_25_count" INTEGER NOT NULL,
    "age_26_40_count" INTEGER NOT NULL,
    "age_41_50_count" INTEGER NOT NULL,
    "over_50_count" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "AgeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LengthOfServiceStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "los_0_5_count" INTEGER NOT NULL,
    "los_6_10_count" INTEGER NOT NULL,
    "los_11_15_count" INTEGER NOT NULL,
    "los_16_20_count" INTEGER NOT NULL,
    "los_21_25_count" INTEGER NOT NULL,
    "los_25_30_count" INTEGER NOT NULL,
    "los_over_30_count" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "LengthOfServiceStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductivityStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "netProfit" DOUBLE PRECISION NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "ProductivityStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Headcount_year_month_companyId_key" ON "public"."Headcount"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStatusStat_year_month_companyId_key" ON "public"."EmployeeStatusStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationStat_year_month_companyId_key" ON "public"."EducationStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "LevelStat_year_month_companyId_key" ON "public"."LevelStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "AgeStat_year_month_companyId_key" ON "public"."AgeStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "LengthOfServiceStat_year_month_companyId_key" ON "public"."LengthOfServiceStat"("year", "month", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductivityStat_year_month_companyId_key" ON "public"."ProductivityStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."Headcount" ADD CONSTRAINT "Headcount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployeeStatusStat" ADD CONSTRAINT "EmployeeStatusStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EducationStat" ADD CONSTRAINT "EducationStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelStat" ADD CONSTRAINT "LevelStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgeStat" ADD CONSTRAINT "AgeStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LengthOfServiceStat" ADD CONSTRAINT "LengthOfServiceStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductivityStat" ADD CONSTRAINT "ProductivityStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
