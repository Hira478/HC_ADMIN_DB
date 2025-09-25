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

      {/* --- BAGIAN INFO BAWAH DENGAN STRUKTUR TETAP 2 SLOT --- */}
      <div className="mt-auto pt-2 text-xs space-y-2">
        {/* Slot 1: YoY Info */}
        <div>
          {change ? (
            <span className={`${changeTextColor} font-bold whitespace-nowrap`}>
              {change}
            </span>
          ) : (
            // Placeholder agar tinggi tetap terjaga
            <span>&nbsp;</span>
          )}
        </div>

        {/* Slot 2: RKAP Info */}
        <div>
          {rkdapInfo ? (
            <span className={`${subTextColor} font-bold`}>
              {rkdapInfo} | RKAP {rkapYear}
            </span>
          ) : (
            // Placeholder agar tinggi tetap terjaga
            <span>&nbsp;</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
