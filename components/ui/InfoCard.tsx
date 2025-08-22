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

      {/* 1. UBAH CONTAINER METRIK MENJADI RATA KIRI */}
      {/* justify-around diubah menjadi justify-start */}
      {/* text-center dihapus dan ditambahkan gap-x-8 untuk spasi antar metrik */}
      <div className="flex flex-1 items-center justify-start gap-x-8">
        {metrics.map((metric, index) => (
          // Hapus justify-center dari blok ini
          <div key={index} className="flex items-baseline gap-2">
            <p className="text-5xl font-bold">{metric.value}</p>
            {/* 2. PERBESAR UKURAN FONT DETAIL */}
            {/* text-sm diubah menjadi text-base */}
            <p className="text-xs text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
