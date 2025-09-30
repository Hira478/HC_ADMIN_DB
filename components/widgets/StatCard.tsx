"use client";

import React from "react";
import InfoTooltip from "../ui/InfoTooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  valueUnit?: string;
  change?: string;
  variant?: "dark" | "light";
  className?: string;
  rkdapInfo?: string;
  details?: string;
  rkapYear?: number;
}

// --- KOMPONEN KECIL BARU UNTUK MENGATUR PERATAAN ---
const AlignedInfoLine: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  // Cek apakah teks dimulai dengan '+' atau '-'
  const hasSign = text.startsWith("+") || text.startsWith("-");

  // Pisahkan tanda dari sisa teksnya
  const sign = hasSign ? text.substring(0, 1) : "";
  const restOfText = hasSign ? text.substring(1) : text;

  return (
    <div className={`flex ${className}`}>
      {/* Buat kolom tak terlihat untuk tanda.
        'w-3' (width: 0.75rem) memberikan ruang yang cukup untuk '+' atau '-'.
        Kolom ini akan selalu ada, mendorong teks ke kanan secara konsisten.
      */}
      <span className="w-3 inline-block text-left">{sign}</span>
      <span>{restOfText}</span>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  valueUnit,
  value,
  change,
  variant = "light",
  className,
  rkdapInfo,
  details,
  rkapYear,
}) => {
  const isDark = variant === "dark";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-500";
  const changeTextColor = isDark ? "text-green-400" : "text-green-600";

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${bgColor} ${textColor} ${className} flex flex-col`}
    >
      {/* Bagian Atas (Judul dan Nilai Utama) */}
      <div>
        <div className="flex justify-between items-center mb-1 gap-2">
          <p
            className={`text-sm font-medium ${subTextColor} whitespace-nowrap overflow-hidden text-ellipsis`}
            title={title}
          >
            {title}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {valueUnit && (
              <p className={`text-xs ${subTextColor} whitespace-nowrap`}>
                {valueUnit}
              </p>
            )}
            {details && <InfoTooltip content={details} />}
          </div>
        </div>
        <p className={`text-2xl font-bold ${textColor} whitespace-nowrap`}>
          {value}
        </p>
      </div>

      {/* --- BAGIAN INFO BAWAH DENGAN KOMPONEN PERATAAN BARU --- */}
      <div className="mt-auto pt-2 text-xs space-y-2">
        {/* Slot 1: YoY Info */}
        <div>
          {change ? (
            <AlignedInfoLine
              text={change}
              className={`${changeTextColor} font-bold whitespace-nowrap`}
            />
          ) : (
            <span>&nbsp;</span>
          )}
        </div>

        {/* Slot 2: RKAP Info */}
        <div>
          {rkdapInfo ? (
            <AlignedInfoLine
              text={`${rkdapInfo} | RKAP ${rkapYear}`}
              className={`${subTextColor} font-bold`}
            />
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
