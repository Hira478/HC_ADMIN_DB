-- CreateTable
CREATE TABLE "public"."RkapTarget" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_employee_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "RkapTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RkapTarget_year_companyId_key" ON "public"."RkapTarget"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."RkapTarget" ADD CONSTRAINT "RkapTarget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
