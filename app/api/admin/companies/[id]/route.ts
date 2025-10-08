// File: app/api/admin/companies/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// --- PUT: Memperbarui perusahaan ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nama dan Tipe wajib diisi." },
        { status: 400 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name, type },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    // Untuk error logging, kita bisa menggunakan params dari context lagi
    const params = await context.params;
    console.error(`API Error PUT /api/admin/companies/${params.id}:`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui perusahaan." },
      { status: 500 }
    );
  }
}

// --- DELETE: Menghapus perusahaan ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    // PENTING: Cek apakah ada user yang terhubung dengan perusahaan ini
    const usersInCompany = await prisma.user.count({
      where: { companyId: id },
    });

    if (usersInCompany > 0) {
      return NextResponse.json(
        {
          error:
            "Tidak bisa menghapus perusahaan ini karena masih ada user yang terhubung.",
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Jika aman, lanjutkan penghapusan
    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Perusahaan berhasil dihapus." });
  } catch (error) {
    // Untuk error logging, kita bisa menggunakan params dari context lagi
    const params = await context.params;
    console.error(`API Error DELETE /api/admin/companies/${params.id}:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus perusahaan." },
      { status: 500 }
    );
  }
}
