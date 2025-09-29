"use client";

import React from "react";

interface QuarterScoreCardProps {
  quarter: string;
  score: number;
  className?: string;
}

const QuarterScoreCard: React.FC<QuarterScoreCardProps> = ({
  quarter,
  score,
  className,
}) => {
  // Menentukan warna berdasarkan skor > 100% (sama seperti di bagan sebelumnya)
  const isExceeding = score > 100;
  const cardColor = isExceeding ? "bg-green-600" : "bg-gray-800";

  return (
    <div
      className={`p-4 rounded-xl shadow-md flex-grow flex items-center justify-between ${className}`}
    >
      <span className="text-lg font-bold">{quarter}</span>
      <span className="text-2xl font-extrabold tracking-tight">
        {score.toFixed(1)}%
      </span>
    </div>
  );
};

export default QuarterScoreCard;
