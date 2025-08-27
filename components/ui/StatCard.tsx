// components/ui/StatCard.tsx

import React from "react";

// Pastikan 'unit' ada di dalam interface ini
interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit }) => {
  return (
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white">
      <h3 className="text-md font-semibold text-gray-300 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold">{value}</span>
        {/* Pastikan 'unit' di-render di sini */}
        <span className="text-lg text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

export default StatCard;
