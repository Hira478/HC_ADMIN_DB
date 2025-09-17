// File: app/api/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    // 1. Ambil sesi user yang sedang login
    const session = await getSession();

    // 2. Keamanan: Pastikan user login dan memiliki role SUPER_ADMIN
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak. Wewenang tidak cukup." },
        { status: 403 } // 403 Forbidden
      );
    }

    // 3. Jika aman, ambil semua data user dari database
    const users = await prisma.user.findMany({
      // Sertakan data perusahaan untuk ditampilkan di tabel
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // 4. Hapus password dari setiap objek user sebelum dikirim ke frontend
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error("API Error in /api/users:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data user." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil sesi dan pastikan user adalah SUPER_ADMIN
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // 2. Ambil data user baru dari body request
    const body = await request.json();
    const { email, name, password, companyId, role } = body;

    if (!email || !name || !password || !companyId || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // 3. Validasi dasar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      ); // 409 Conflict
    }

    // 4. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId: Number(companyId),
        role: role as UserRole, // Casting ke tipe Enum
      },
      include: {
        // Sertakan company untuk respons
        company: { select: { name: true } },
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("API Error in POST /api/users:", error);
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 });
  }
}
