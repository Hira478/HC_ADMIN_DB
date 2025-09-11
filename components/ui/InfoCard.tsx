// File: /components/ui/InfoCard.tsx

import React from "react";
import InfoTooltip from "./InfoTooltip";

interface Metric {
  value: string | number;
  label: string;
}

interface InfoCardProps {
  title: string;
  metrics: Metric[];
  // 1. Tambahkan prop baru untuk mode perataan (alignment)
  alignMode?: "baseline" | "start";
  tooltipText?: string;
  tooltipAlign?: "center" | "left" | "right";
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  metrics,
  alignMode = "baseline", // 2. Set default ke 'baseline' (rata bawah)
  tooltipText,
  tooltipAlign,
}) => {
  return (
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white flex flex-col flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        {/* Tooltip hanya akan muncul jika prop tooltipText diisi */}
        {tooltipText && (
          // 3. TERUSKAN PROP DARI INFOCARD KE INFOTOOLTIP
          <InfoTooltip
            content={tooltipText}
            position="bottom"
            align={tooltipAlign}
          />
        )}
      </div>

      <div className="flex flex-grow items-center justify-start">
        {metrics.map((metric, index) => (
          // 3. Gunakan prop 'alignMode' untuk memilih kelas Tailwind secara dinamis
          <div
            key={index}
            className={`flex ${
              alignMode === "start" ? "items-start" : "items-baseline"
            } mr-8 last:mr-0`}
          >
            <p className="text-3xl font-bold">{metric.value}</p>
            {/* Kita kembalikan ml-2 karena semua layout sekarang menyamping */}
            <p className="text-xs text-gray-400 whitespace-pre-line ml-2">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
