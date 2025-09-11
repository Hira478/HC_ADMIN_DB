// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Bagian metadata ini standar dan baik untuk SEO
export const metadata: Metadata = {
  title: "HC Dashboard",
  description: "Human Capital Dashboard Application",
};

// --- BAGIAN YANG HILANG ADA DI SINI ---
// Deklarasi fungsi 'RootLayout' perlu ditambahkan kembali.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
