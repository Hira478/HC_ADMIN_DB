// File: /components/ui/InfoCard.tsx

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
    // Hapus 'h-full' agar kartu tidak merentang secara paksa
    <div className="bg-[#343A40] p-6 rounded-lg shadow-md text-white flex flex-col">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>

      {/* Gunakan 'justify-around' untuk memberi spasi merata jika ada 2 metrik.
        Gunakan 'flex-grow' untuk mendorong konten ini ke bawah setelah judul.
      */}
      <div className="flex flex-grow items-center justify-around">
        {metrics.map((metric, index) => (
          // Buat setiap metrik menjadi flex column dan tengahkan
          <div key={index} className="flex flex-col items-center text-center">
            <p className="text-3xl font-bold">{metric.value}</p>
            <p className="text-xs text-gray-400 whitespace-pre-line mt-1">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
