-- CreateTable
CREATE TABLE "public"."OrganizationHealthStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "accountability" DOUBLE PRECISION NOT NULL,
    "motivation" DOUBLE PRECISION NOT NULL,
    "coordination_control" DOUBLE PRECISION NOT NULL,
    "leadership" DOUBLE PRECISION NOT NULL,
    "innovation_learning" DOUBLE PRECISION NOT NULL,
    "external_orientation" DOUBLE PRECISION NOT NULL,
    "direction" DOUBLE PRECISION NOT NULL,
    "capabilities" DOUBLE PRECISION NOT NULL,
    "work_environment" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrganizationHealthStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationHealthStat_year_companyId_key" ON "public"."OrganizationHealthStat"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."OrganizationHealthStat" ADD CONSTRAINT "OrganizationHealthStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
