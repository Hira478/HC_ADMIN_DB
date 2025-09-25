// File: /components/ui/InfoCard.tsx

import React from "react";
import InfoTooltip from "./InfoTooltip";

interface Metric {
  value: string | number;
  label: string;
  labelColorClass?: string;
}

interface InfoCardProps {
  title: string;
  metrics: Metric[];
  alignMode?: "baseline" | "start";
  tooltipText?: string;
  tooltipAlign?: "center" | "left" | "right";
  layout?: "horizontal" | "vertical";
  // 1. Tambahkan prop baru untuk ukuran font label
  labelSize?: "xs" | "sm" | "base" | "lg";
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  metrics,
  alignMode = "baseline",
  tooltipText,
  tooltipAlign,
  layout = "horizontal",
  // 2. Set nilai default ke 'xs' agar tidak merusak tampilan lain
  labelSize = "xs",
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
          <div
            key={index}
            className={`flex ${
              layout === "vertical"
                ? "flex-col"
                : alignMode === "start"
                ? "items-start"
                : "items-baseline"
            } mr-8 last:mr-0`}
          >
            <p className="text-3xl font-bold">{metric.value}</p>
            {/* 3. Gunakan prop 'labelSize' untuk mengatur kelas font secara dinamis */}
            <p
              // Terapkan kelas warna jika ada, jika tidak gunakan text-white
              className={`whitespace-pre-line ${
                layout === "vertical" ? "mt-1" : "ml-2"
              } text-${labelSize} ${metric.labelColorClass || "text-white"}`}
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
