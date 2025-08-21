// components/ui/InfoCard.tsx

import React from "react";

interface Metric {
  value: string | number;
  label: string;
}

interface InfoCardProps {
  title: string;
  metrics: Metric[];
}

const InfoCard: React.FC<InfoCardProps> = ({ title, metrics }) => {
  return (
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>

      <div className="flex flex-1 items-center justify-around text-center">
        {metrics.map((metric, index) => (
          // --- PERUBAHAN DI SINI ---
          // Mengubah div ini menjadi flex container horizontal
          <div key={index} className="flex items-baseline justify-center gap-2">
            <p className="text-5xl font-bold">{metric.value}</p>
            <p className="text-sm text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
