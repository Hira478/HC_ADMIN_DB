-- CreateTable
CREATE TABLE "public"."HcmaScore" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "talentSuccession" DOUBLE PRECISION NOT NULL,
    "rewardRecognition" DOUBLE PRECISION NOT NULL,
    "learningDevelopment" DOUBLE PRECISION NOT NULL,
    "performanceGoal" DOUBLE PRECISION NOT NULL,
    "capacityStrategy" DOUBLE PRECISION NOT NULL,
    "behaviourCulture" DOUBLE PRECISION NOT NULL,
    "humanCapitalIt" DOUBLE PRECISION NOT NULL,
    "leadership" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "HcmaScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HcmaScore_year_companyId_key" ON "public"."HcmaScore"("year", "companyId");

-- AddForeignKey
ALTER TABLE "public"."HcmaScore" ADD CONSTRAINT "HcmaScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
