// app/api/charts/organization-health/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, OrganizationHealthStat } from "@prisma/client";

const prisma = new PrismaClient();

export interface OrganizationHealthData {
  categories: string[];
  currentYear: number;
  previousYear: number | null;
  currentYearData: number[];
  previousYearData: number[];
  currentYearScore: number;
  previousYearScore: number | null;
}

const formatData = (record: OrganizationHealthStat | null) => {
  if (!record) return [];
  // Sesuaikan dengan 9 field baru, urutan harus sama dengan categories
  return [
    record.workEnvironment,
    record.capabilities,
    record.direction,
    record.externalOrientation,
    record.innovationLearning,
    record.leadership,
    record.coordinationControl,
    record.motivation,
    record.accountability,
  ];
};

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
    // Daftar kategori baru (dibalik agar Accountability di atas)
    const categories = [
      "Work Environtment",
      "Capabilities",
      "Direction",
      "External Orientation",
      "Innovation & Learning",
      "Leadership",
      "Coordination & Control",
      "Motivation",
      "Accountability",
    ];

    // Query ke tabel baru: OrganizationHealthStat
    const currentYearRecord = await prisma.organizationHealthStat.findUnique({
      where: {
        year_companyId: { year: currentYearNum, companyId: companyIdNum },
      },
    });
    const previousYearRecord = await prisma.organizationHealthStat.findUnique({
      where: {
        year_companyId: { year: previousYearNum, companyId: companyIdNum },
      },
    });

    const responseData: OrganizationHealthData = {
      categories,
      currentYear: currentYearNum,
      previousYear: previousYearRecord ? previousYearNum : null,
      currentYearData: formatData(currentYearRecord),
      previousYearData: formatData(previousYearRecord),
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
