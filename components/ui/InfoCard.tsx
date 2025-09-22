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
  alignMode?: "baseline" | "start";
  tooltipText?: string;
  tooltipAlign?: "center" | "left" | "right";
  // 1. Tambahkan prop baru untuk layout
  layout?: "horizontal" | "vertical";
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  metrics,
  alignMode = "baseline",
  tooltipText,
  tooltipAlign,
  // 2. Set nilai default prop layout ke 'horizontal'
  layout = "horizontal",
}) => {
  return (
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white flex flex-col flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        {tooltipText && (
          <InfoTooltip
            content={tooltipText}
            position="bottom"
            align={tooltipAlign}
          />
        )}
      </div>

      <div className="flex flex-grow items-center justify-start">
        {metrics.map((metric, index) => (
          // 3. Terapkan logika untuk mengubah kelas CSS berdasarkan prop 'layout'
          <div
            key={index}
            className={`flex ${
              layout === "vertical"
                ? "flex-col" // Terapkan flex-col untuk layout atas-bawah
                : alignMode === "start"
                ? "items-start"
                : "items-baseline" // Layout default kiri-kanan
            } mr-8 last:mr-0`}
          >
            <p className="text-3xl font-bold">{metric.value}</p>
            <p
              className={`text-xs text-gray-400 whitespace-pre-line ${
                // 4. Ubah margin berdasarkan layout
                layout === "vertical" ? "mt-1" : "ml-2"
              }`}
            >
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
