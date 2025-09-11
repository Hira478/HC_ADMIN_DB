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
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  valueUnit,
  value,
  change,
  variant = "light",
  className,
  rkdapInfo,
  details,
}) => {
  const isDark = variant === "dark";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-500";
  const changeTextColor = isDark ? "text-green-400" : "text-green-600";

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${bgColor} ${textColor} ${className}`}
    >
      <div className="flex justify-between items-center mb-1 gap-2">
        {/* --- PERUBAHAN DI SINI --- */}
        <p
          className={`text-sm font-medium ${subTextColor} whitespace-nowrap overflow-hidden text-ellipsis`}
          title={title} // Menampilkan judul penuh saat hover
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

      {/* Font size di sini sebelumnya text-2xl, disesuaikan kembali ke text-3xl */}
      <p className={`text-2xl font-bold ${textColor} mb-2 whitespace-nowrap`}>
        {value}
      </p>

      {change && (
        <div className="flex items-center text-xs">
          <span
            className={`${changeTextColor} font-semibold whitespace-nowrap`}
          >
            {change}
          </span>
        </div>
      )}

      {/* --- TAMBAHAN BARU DI SINI --- */}
      {/* Tampilkan info RKAP jika ada */}
      {rkdapInfo && (
        <div className="text-xs text-gray-400">{rkdapInfo} | RKAP 2025</div>
      )}
    </div>
  );
};

export default StatCard;
