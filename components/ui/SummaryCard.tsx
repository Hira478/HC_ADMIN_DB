// components/ui/SummaryCard.tsx

import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  trend,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1">
      <h3 className="text-gray-500 text-md mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-800">{value}</span>
        {unit && <span className="text-gray-600">{unit}</span>}
      </div>
      {trend && <p className="text-sm text-gray-400 mt-1">{trend}</p>}
    </div>
  );
};

export default SummaryCard;
