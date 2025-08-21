-- CreateTable
CREATE TABLE "public"."EmployeeEngagementStat" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "say" DOUBLE PRECISION NOT NULL,
    "stay" DOUBLE PRECISION NOT NULL,
    "strive" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EmployeeEngagementStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEngagementStat_year_companyId_key" ON "public"."EmployeeEngagementStat"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."EmployeeEngagementStat" ADD CONSTRAINT "EmployeeEngagementStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
