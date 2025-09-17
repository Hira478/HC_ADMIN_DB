// File: app/api/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { UserRole, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

// --- FUNGSI DELETE ---
export async function DELETE(request: NextRequest) {
  try {
    const idParam = request.nextUrl.pathname.split("/").pop(); // Ambil ID dari URL
    const id = parseInt(idParam || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    if (session.userId === id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API Error in DELETE /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus user." },
      { status: 500 }
    );
  }
}

// --- FUNGSI PUT ---
export async function PUT(request: NextRequest) {
  try {
    const idParam = request.nextUrl.pathname.split("/").pop(); // Ambil id dari URL
    const id = parseInt(idParam || "");

    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, companyId, role, password } = body;

    const updateData: {
      email: string;
      name: string;
      companyId: number;
      role: UserRole;
      password?: string;
    } = {
      email,
      name,
      companyId: Number(companyId),
      role: role as UserRole,
    };

    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { company: { select: { name: true } } },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === "P2002" &&
        (error.meta?.target as string[])?.includes("email")
      ) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh user lain." },
          { status: 409 }
        );
      }
    }

    console.error("API Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate user." },
      { status: 500 }
    );
  }
}
