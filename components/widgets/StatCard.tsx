// components/widgets/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  valueUnit?: string;
  value: string;
  change: string;
  comparison?: string;
  rkdapInfo: string;
  icon: React.ReactNode;
  variant?: "dark" | "light";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  valueUnit,
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

  // TIDAK PERLU LAGI MEMISAHKAN "Rp" KARENA TAMPIL SATU BARIS
  // const isCurrency = value.startsWith("Rp ");
  // let currencySymbol = "";
  // let amount = value;
  // if (isCurrency) { ... }

  return (
    <div
      className={`relative p-5 rounded-xl shadow-md flex flex-col justify-between ${cardBg} ${className}`}
    >
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
            {valueUnit && (
              <span
                className={`ml-1.5 text-xs font-normal opacity-70 ${titleColor}`}
              >
                {valueUnit}
              </span>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
          </div>
        </div>

        {/* --- PERUBAHAN UTAMA DI SINI --- */}
        {/* Tampilkan nilai 'value' secara langsung dalam satu baris */}
        <div className="mt-1">
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center text-xs">
          <p className="text-green-500 font-semibold">{change}</p>
          <p className={`ml-2 ${titleColor}`}>{comparison}</p>
        </div>
        <p className={`text-xs mt-1 ${titleColor}`}>{rkdapInfo}</p>
      </div>
    </div>
  );
};

export default StatCard;
