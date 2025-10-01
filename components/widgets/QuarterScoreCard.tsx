"use client";

import React from "react";

interface QuarterScoreCardProps {
  quarter: string;
  score?: number;
  className?: string;
  onClick?: () => void;
  isPlaceholder?: boolean;
}

const QuarterScoreCard: React.FC<QuarterScoreCardProps> = ({
  quarter,
  score,
  className,
  onClick,
  isPlaceholder = false,
}) => {
  if (isPlaceholder) {
    return (
      <div
        onClick={onClick}
        // --- TAMBAHKAN flex-grow ---
        className={`bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 p-4 rounded-xl flex-grow flex items-center justify-center ${
          onClick ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""
        }`}
      >
        <span className="text-sm font-semibold text-center">
          {quarter} - No Data
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      // --- PERUBAHAN DI SINI ---
      // 'justify-between' diubah menjadi 'flex-col' dan 'justify-center'
      className={`p-4 rounded-xl shadow-md flex-grow flex items-center justify-center gap-1 ${className} ${
        onClick ? "cursor-pointer transition-transform hover:scale-105" : ""
      }`}
    >
      <span className="text-xl font-extrabold">{quarter} - </span>
      <span className="text-xl font-extrabold tracking-tight">
        {score?.toFixed(1)}%
      </span>
    </div>
  );
};

export default QuarterScoreCard;
