// app/api/charts/organization-health/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, HcmaScore } from "@prisma/client";

const prisma = new PrismaClient();

// Tipe untuk data yang akan kita kembalikan
export interface OrganizationHealthData {
  categories: string[];
  currentYear: number;
  previousYear: number | null;
  currentYearData: number[];
  previousYearData: number[];
  currentYearScore: number;
  previousYearScore: number | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const year = searchParams.get("year");

  if (!companyId || !year) {
    return NextResponse.json(
      { error: "companyId and year are required" },
      { status: 400 }
    );
  }

  const companyIdNum = parseInt(companyId);
  const currentYearNum = parseInt(year);
  const previousYearNum = currentYearNum - 1;

  try {
    const categories = [
      "Leadership",
      "Human Capital IT",
      "Behaviour & Culture",
      "Capacity & Strategy",
      "Performance & Goal",
      "Learning & Development",
      "Reward & Recognition",
      "Talent & Sucession",
    ];

    // Ambil data untuk tahun yang dipilih
    const currentYearRecord = await prisma.hcmaScore.findUnique({
      where: {
        year_companyId: { year: currentYearNum, companyId: companyIdNum },
      },
    });

    // Ambil data untuk tahun sebelumnya
    const previousYearRecord = await prisma.hcmaScore.findUnique({
      where: {
        year_companyId: { year: previousYearNum, companyId: companyIdNum },
      },
    });

    const formatData = (record: HcmaScore | null) => {
      if (!record) return [];
      // Urutkan data sesuai urutan kategori
      return [
        record.leadership,
        record.humanCapitalIt,
        record.behaviourCulture,
        record.capacityStrategy,
        record.performanceGoal,
        record.learningDevelopment,
        record.rewardRecognition,
        record.talentSuccession,
      ];
    };

    const responseData: OrganizationHealthData = {
      categories,
      currentYear: currentYearNum,
      previousYear: previousYearRecord ? previousYearNum : null,
      currentYearData: currentYearRecord ? formatData(currentYearRecord) : [],
      previousYearData: previousYearRecord
        ? formatData(previousYearRecord)
        : [],
      currentYearScore: currentYearRecord ? currentYearRecord.totalScore : 0,
      previousYearScore: previousYearRecord
        ? previousYearRecord.totalScore
        : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch organization health data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
