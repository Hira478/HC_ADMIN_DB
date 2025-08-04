// components/sections/EmployeeCostSection.tsx
import StatCard from "@/components/widgets/StatCard";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";

const EmployeeCostSection = () => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kolom Kiri: Stat Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <StatCard
            title="Total Employee Cost"
            value="Rp. 82 M"
            change="+10% | Year on Year"
            comparison=""
            rkdapInfo="70% | RKAP 2025"
            icon={<></>}
            variant="dark"
            className="flex-1" // <-- Tambahkan kelas ini
          />
          <StatCard
            title="Employee Cost Rasio"
            value="Rp. 1 M"
            change=""
            comparison=""
            rkdapInfo=""
            icon={<></>}
            variant="dark"
            className="flex-1" // <-- Tambahkan kelas ini
          />
        </div>

        {/* Kolom Kanan: Chart */}
        <div className="lg:col-span-3">
          {/* Pastikan komponen Chart memiliki h-full */}
          <EmployeeCostChartCard />
        </div>
      </div>
    </section>
  );
};

export default EmployeeCostSection;
