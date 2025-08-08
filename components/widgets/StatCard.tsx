// components/widgets/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  comparison?: string;
  rkdapInfo: string;
  icon: React.ReactNode;
  variant?: "dark" | "light";
  notificationCount?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  comparison,
  rkdapInfo,
  icon,
  variant = "light",
  className,
}) => {
  const isDark = variant === "dark";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const titleColor = isDark ? "text-gray-400" : "text-gray-500";
  const valueColor = isDark ? "text-white" : "text-gray-800";
  const iconBg = isDark ? "bg-gray-700" : "bg-blue-50";
  const iconColor = isDark ? "text-white" : "text-blue-600";

  return (
    // TAMBAHKAN justify-between DI SINI
    <div
      className={`relative p-5 rounded-lg shadow-md flex flex-col justify-between ${cardBg} ${className}`}
    >
      {/* Blok Konten Atas */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm ${titleColor}`}>{title}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
        </div>
      </div>

      {/* Blok Konten Bawah (HAPUS mt-auto DARI SINI) */}
      <div>
        <div className="flex items-center mt-2 text-xs">
          <p className="text-green-500 font-semibold">{change}</p>
          <p className={`ml-2 ${titleColor}`}>{comparison}</p>
        </div>
        <p className={`text-xs mt-1 ${titleColor}`}>{rkdapInfo}</p>
      </div>
    </div>
  );
};

export default StatCard;
