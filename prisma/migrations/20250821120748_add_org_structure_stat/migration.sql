-- CreateTable
CREATE TABLE "public"."OrganizationStructureStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "risiko_tata_kelola" DOUBLE PRECISION NOT NULL,
    "sdm_umum" DOUBLE PRECISION NOT NULL,
    "keuangan" DOUBLE PRECISION NOT NULL,
    "it" DOUBLE PRECISION NOT NULL,
    "operasional" DOUBLE PRECISION NOT NULL,
    "bisnis" DOUBLE PRECISION NOT NULL,
    "cabang" DOUBLE PRECISION NOT NULL,
    "enabler_count" INTEGER NOT NULL,
    "revenue_generator_count" INTEGER NOT NULL,
    "division_count" INTEGER NOT NULL,
    "department_count" INTEGER NOT NULL,
    "avg_span_department" INTEGER NOT NULL,
    "avg_span_employee" INTEGER NOT NULL,

    CONSTRAINT "OrganizationStructureStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStructureStat_year_companyId_key" ON "public"."OrganizationStructureStat"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."OrganizationStructureStat" ADD CONSTRAINT "OrganizationStructureStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
