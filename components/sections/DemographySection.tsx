// components/sections/DemographySection.tsx

import TotalHeadcountCard from "@/components/widgets/Demography/TotalHeadcountCard";
import EmployeeStatusCard from "@/components/widgets/Demography/EmployeeStatusCard";
import EducationChartCard from "@/components/widgets/Demography/EducationChartCard";
import LevelChartCard from "@/components/widgets/Demography/LevelChartCard";
import AgeChartCard from "@/components/widgets/Demography/AgeChartCard";
import LengthOfServiceChartCard from "@/components/widgets/Demography/LengthOfServiceChartCard";
import type { DemographyData } from "@/types";

// By aliasing 'data' to '_data', we signal that it's intentionally unused for now.
const DemographySection = ({
  data: _data,
}: {
  data: DemographyData | undefined;
}) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Demography</h2>

      {/* Kita hapus lg:grid-rows-3 agar lebih fleksibel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 */}
        <div className="lg:col-start-1 lg:row-start-1 h-[300px]">
          {" "}
          {/* <-- Beri tinggi tetap */}
          <TotalHeadcountCard />
        </div>
        <div className="lg:col-start-1 lg:row-start-2 lg:row-span-2 h-auto">
          <EmployeeStatusCard />
        </div>

        {/* Kolom 2 */}
        <div className="lg:col-start-2 lg:row-start-1 h-[300px]">
          {" "}
          {/* <-- Beri tinggi tetap */}
          <EducationChartCard />
        </div>
        <div className="lg:col-start-2 lg:row-start-2 h-[300px]">
          {" "}
          {/* <-- Beri tinggi tetap */}
          <LevelChartCard />
        </div>

        {/* Kolom 3 */}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2">
          <AgeChartCard />
        </div>

        {/* Baris Bawah */}
        <div className="lg:col-start-2 lg:row-start-3 lg:col-span-2 h-[300px]">
          {" "}
          {/* <-- Beri tinggi tetap */}
          <LengthOfServiceChartCard />
        </div>
      </div>
    </section>
  );
};

export default DemographySection;
