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
  details,
}) => {
  const isDark = variant === "dark";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-500";

  // --- PERUBAHAN DI SINI ---
  // Logika warna disederhanakan agar selalu hijau
  const changeTextColor = isDark ? "text-green-400" : "text-green-600";

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${bgColor} ${textColor} ${className}`}
    >
      <div className="flex justify-between items-center mb-1">
        <h3
          className={`text-md font-semibold ${subTextColor} whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {valueUnit && (
            <p className={`text-xs ${subTextColor} whitespace-nowrap`}>
              {valueUnit}
            </p>
          )}
          {details && <InfoTooltip content={details} />}
        </div>
      </div>

      <p className={`text-3xl font-bold ${textColor} mb-2 whitespace-nowrap`}>
        {value}
      </p>

      {change && (
        <div className="flex items-center text-sm">
          <span
            className={`${changeTextColor} font-semibold whitespace-nowrap`}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
