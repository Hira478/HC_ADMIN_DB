// app/api/employees/details/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Fungsi bantuan untuk menghitung umur
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Fungsi bantuan untuk menghitung lama bekerja
function calculateYearsOfService(hireDate: Date): number {
  const today = new Date();
  let years = today.getFullYear() - hireDate.getFullYear();
  const m = today.getMonth() - hireDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < hireDate.getDate())) {
    years--;
  }
  return years < 0 ? 0 : years; // Pastikan tidak negatif
}

export async function GET() {
  try {
    // 1. Ambil data mentah dari database
    const employeesFromDb = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        educationLevel: true,
        jobLevel: true,
        hireDate: true,
        terminationDate: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // 2. Transformasi data: hitung umur dan lama bekerja
    const employeeDetails = employeesFromDb.map((emp) => ({
      id: emp.id,
      name: emp.name,
      age: calculateAge(emp.birthDate),
      gender: emp.gender,
      educationLevel: emp.educationLevel,
      jobLevel: emp.jobLevel,
      yearsOfService: calculateYearsOfService(emp.hireDate),
      birthDate: emp.birthDate.toISOString(),
      hireDate: emp.hireDate.toISOString(),
      terminationDate: emp.terminationDate
        ? emp.terminationDate.toISOString()
        : null,
    }));

    // 3. Kembalikan data yang sudah ditransformasi
    return NextResponse.json(employeeDetails);
  } catch (error) {
    console.error("Failed to fetch employee details:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data karyawan." },
      { status: 500 }
    );
  }
}
