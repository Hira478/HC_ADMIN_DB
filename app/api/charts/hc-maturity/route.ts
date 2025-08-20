// app/api/charts/hc-maturity/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const yearNum = parseInt(year);

  try {
    const record = await prisma.hcmaScore.findUnique({
      where: { year_companyId: { year: yearNum, companyId: companyIdNum } },
    });

    if (!record) {
      // Jika data tidak ada, kembalikan data kosong agar chart tidak error
      return NextResponse.json({
        categories: [],
        data: [],
      });
    }

    // Transformasi data dari database ke format yang dibutuhkan chart
    const chartData = {
      categories: [
        "Talent & Succession",
        "Reward & Recognition",
        "Learning & Development",
        "Performance & Goal",
        "Capacity & Strategy",
        "Behaviour & Culture",
        "Human Capital IT",
        "Leadership",
      ],
      data: [
        record.talentSuccession,
        record.rewardRecognition,
        record.learningDevelopment,
        record.performanceGoal,
        record.capacityStrategy,
        record.behaviourCulture,
        record.humanCapitalIt,
        record.leadership,
      ],
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Failed to fetch HC maturity data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
