// components/sections/DemographySection.tsx

import TotalHeadcountCard from "@/components/widgets/Demography/TotalHeadcountCard";
import EmployeeStatusCard from "@/components/widgets/Demography/EmployeeStatusCard";
import EducationChartCard from "@/components/widgets/Demography/EducationChartCard";
import LevelChartCard from "@/components/widgets/Demography/LevelChartCard";
import AgeChartCard from "@/components/widgets/Demography/AgeChartCard";
import LengthOfServiceChartCard from "@/components/widgets/Demography/LengthOfServiceChartCard";

const DemographySection = () => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Demography</h2>

      {/* Kita definisikan grid dengan 3 kolom dan 3 baris secara eksplisit.
        Ini memberi kita kontrol penuh atas penempatan setiap elemen.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 gap-6">
        {/* Kolom 1, Baris 1 */}
        <div className="lg:col-start-1 lg:row-start-1">
          <TotalHeadcountCard />
        </div>

        {/* Kolom 1, mulai dari baris 2, tinggi 2 baris */}
        <div className="lg:col-start-1 lg:row-start-2 lg:row-span-2">
          <EmployeeStatusCard />
        </div>

        {/* Kolom 2, Baris 1 */}
        <div className="lg:col-start-2 lg:row-start-1">
          <EducationChartCard />
        </div>

        {/* Kolom 2, Baris 2 */}
        <div className="lg:col-start-2 lg:row-start-2">
          <LevelChartCard />
        </div>

        {/* Kolom 3, mulai dari baris 1, tinggi 2 baris */}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2">
          <AgeChartCard />
        </div>

        {/* Mulai dari kolom 2, di baris 3, lebar 2 kolom */}
        <div className="lg:col-start-2 lg:row-start-3 lg:col-span-2">
          <LengthOfServiceChartCard />
        </div>
      </div>
    </section>
  );
};

export default DemographySection;
