// File: /lib/scoring.ts

/**
 * Menentukan label skor untuk Employee Engagement & Culture Maturity.
 * (Fungsi ini tidak diubah)
 */
export function getScoreLabel(score: number): string {
  if (score > 81.24) {
    return "High";
  }
  if (score >= 62.25) {
    return "Moderate High";
  }
  if (score >= 43.5) {
    return "Moderate Low";
  }
  if (score >= 25) {
    return "Low";
  }
  return "N/A";
}

// --- TAMBAHKAN FUNGSI BARU DI BAWAH INI ---

/**
 * Menentukan label skor untuk HC Maturity Assessment.
 * Rentang skor:
 * - 1.00 - 1.75 = Low
 * - 1.76 - 2.50 = Medium
 * - 2.51 - 3.25 = Good
 * - 3.26 - 4.00 = Excellence
 * @param score Skor numerik dari 1.00 hingga 4.00.
 * @returns String label yang sesuai (e.g., "Good").
 */
export function getHcmaScoreLabel(score: number): string {
  if (score > 3.25) {
    return "Excellence";
  }
  if (score > 2.5) {
    return "Good";
  }
  if (score > 1.75) {
    return "Medium";
  }
  if (score >= 1.0) {
    return "Low";
  }
  // Fallback jika skor tidak valid
  return "N/A";
}

// UBAH FUNGSI DI BAWAH INI
/**
 * Menentukan informasi skor (teks dan warna) untuk HC Maturity Assessment.
 * @param score Skor numerik dari 1.00 hingga 4.00.
 * @returns Objek berisi 'text' dan 'colorClass'.
 */
export function getHcmaScoreInfo(score: number): {
  text: string;
  colorClass: string;
} {
  if (score > 3.25) {
    return { text: "Excellence", colorClass: "text-sky-400" }; // Biru Langit
  }
  if (score > 2.5) {
    return { text: "Good", colorClass: "text-green-400" }; // Hijau
  }
  if (score > 1.75) {
    return { text: "Medium", colorClass: "text-yellow-400" }; // Kuning
  }
  if (score >= 1.0) {
    return { text: "Low", colorClass: "text-red-400" }; // Merah
  }
  return { text: "N/A", colorClass: "text-gray-400" }; // Fallback
}
