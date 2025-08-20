// components/ui/InfoCard.tsx

import React from "react";

// Definisikan tipe untuk props agar lebih mudah dikelola
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
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white w-full">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="flex justify-between items-center">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <p className="text-4xl font-bold">{metric.value}</p>
            <p className="text-sm text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
