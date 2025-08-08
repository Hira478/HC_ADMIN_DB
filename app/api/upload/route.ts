import { NextResponse, NextRequest } from "next/server";
import * as xlsx from "xlsx";

// Definisikan tipe untuk baris data Excel agar lebih aman daripada 'any'
type ExcelRow = Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diupload." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });

    // Gunakan tipe ExcelRow yang sudah kita definisikan
    const allSheetsData: Record<string, ExcelRow[]> = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      // Beri tahu TypeScript bahwa hasil dari fungsi ini adalah array dari ExcelRow
      const data = xlsx.utils.sheet_to_json(worksheet) as ExcelRow[];
      allSheetsData[sheetName] = data;
    });

    return NextResponse.json({
      message: `File dengan ${workbook.SheetNames.length} sheet berhasil dibaca.`,
      data: allSheetsData,
    });
  } catch (error) {
    // <-- Hapus `: any`
    // Tambahkan pengecekan tipe error untuk keamanan
    console.error("API Upload Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Gagal memproses file: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Gagal memproses file karena kesalahan tidak diketahui." },
      { status: 500 }
    );
  }
}
