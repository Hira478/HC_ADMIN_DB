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
  // Render placeholder jika tidak ada data
  if (isPlaceholder) {
    return (
      <div
        onClick={onClick}
        className={`bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 p-4 rounded-xl flex-grow flex items-center justify-center ${
          onClick ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""
        }`}
      >
        <span className="font-semibold text-center">{quarter} - No Data</span>
      </div>
    );
  }

  // Render kartu skor jika ada data
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl shadow-md flex-grow flex items-center justify-between ${className} ${
        onClick ? "cursor-pointer transition-transform hover:scale-105" : ""
      }`}
    >
      <span className="text-lg font-bold">{quarter}</span>
      <span className="text-2xl font-extrabold tracking-tight">
        {score?.toFixed(1)}%
      </span>
    </div>
  );
};

export default QuarterScoreCard;
