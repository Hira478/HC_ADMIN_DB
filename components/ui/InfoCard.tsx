// File: /components/ui/InfoCard.tsx

import React from "react";
import InfoTooltip from "./InfoTooltip";

interface Metric {
  value: string | number;
  label: string;
  labelColorClass?: string;
  indicator?: string;
}

interface InfoCardProps {
  title: string;
  metrics: Metric[];
  alignMode?: "baseline" | "start";
  tooltipText?: string;
  tooltipAlign?: "center" | "left" | "right";
  layout?: "horizontal" | "vertical";
  labelSize?: "xs" | "sm" | "base" | "lg";
  // PERUBAHAN 1: Tambahkan prop boolean baru untuk style khusus ini
  specialHCMAStyle?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  metrics,
  alignMode = "baseline",
  tooltipText,
  tooltipAlign,
  layout = "horizontal",
  labelSize = "xs",
  // Ambil prop baru
  specialHCMAStyle = false,
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
          <div key={index} className="mr-8 last:mr-0">
            {/* PERUBAHAN 2: Gunakan ternary untuk memilih layout */}
            {specialHCMAStyle ? (
              // Layout Khusus untuk HCMA
              <div className="flex flex-col items-start">
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p
                    className={`ml-2 whitespace-pre-line text-${labelSize} ${
                      metric.labelColorClass || "text-white"
                    }`}
                  >
                    {metric.label}
                  </p>
                </div>
                {metric.indicator && (
                  <p className="text-ms text-gray-400 mt-1 font-medium">
                    {metric.indicator}
                  </p>
                )}
              </div>
            ) : (
              // Layout Normal untuk semua kartu lain
              <div
                className={`flex ${
                  layout === "vertical"
                    ? "flex-col items-start"
                    : alignMode === "start"
                    ? "items-start"
                    : "items-baseline"
                }`}
              >
                <p className="text-3xl font-bold">{metric.value}</p>
                <div
                  className={`flex flex-col ${
                    layout === "vertical" ? "mt-1" : "ml-2"
                  }`}
                >
                  <p
                    className={`whitespace-pre-line text-${labelSize} ${
                      metric.labelColorClass || "text-white"
                    }`}
                  >
                    {metric.label}
                  </p>
                  {metric.indicator && (
                    <p className="text-xs text-gray-400 mt-1 font-light">
                      {metric.indicator}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
