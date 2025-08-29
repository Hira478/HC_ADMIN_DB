-- CreateTable
CREATE TABLE "public"."TurnoverStat" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "resignCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TurnoverStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TurnoverStat_year_month_companyId_key" ON "public"."TurnoverStat"("year", "month", "companyId");

-- AddForeignKey
ALTER TABLE "public"."TurnoverStat" ADD CONSTRAINT "TurnoverStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
