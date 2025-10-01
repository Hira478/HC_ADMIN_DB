"use client";

import StatCard from "@/components/widgets/StatCard";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";
import EmployeeCostStackedChart from "@/components/widgets/EmployeeCostStackedChart";
import type {
  EmployeeCostCardData,
  RkapTargetData,
  StackedChartData,
} from "@/types";

const calculateRkapAchieved = (actual: number, target: number): string => {
  if (target === 0) return "-";
  const achievement = (actual / target) * 100;
  return `${achievement.toFixed(1)}%`;
};

// Interface ini sudah benar.
interface EmployeeCostSectionProps {
  data: EmployeeCostCardData | undefined;
  loading: boolean;
  rkapData: RkapTargetData | null;
  stackedChartData: StackedChartData | null;
  loadingStackedChart: boolean;
}

// --- PERBAIKAN DI SINI ---
// Hapus definisi tipe inline dan gunakan EmployeeCostSectionProps
const EmployeeCostSection = ({
  data,
  loading,
  rkapData,
  stackedChartData,
  loadingStackedChart,
}: EmployeeCostSectionProps) => {
  // <-- GUNAKAN INTERFACE YANG SUDAH DIBUAT

  // Skeleton UI loading (tidak diubah)
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-[432px] w-full">
        <div className="h-full w-full bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  // Tampilan 'No Data' (tidak diubah)
  if (!data) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        {/* Tampilkan card dengan nilai default */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Employee Cost" value="N/A" variant="dark" />
          <StatCard title="Total Cost" value="N/A" variant="dark" />
          <StatCard title="Cost per Employee" value="N/A" variant="light" />
          <StatCard title="Employee Cost Ratio" value="N/A" variant="light" />
        </div>
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md h-[432px] flex items-center justify-center text-gray-500">
          No Chart Data Available.
        </div>
      </section>
    );
  }

  const actualTotalEmployeeCost = data
    ? parseFloat(data.total.value.replace(/[^0-9-]/g, ""))
    : 0;

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... StatCard components ... */}
        <StatCard
          title="Total Employee Cost"
          value={data.total.value}
          change={data.total.change || ""}
          valueUnit="Unit: Million"
          rkdapInfo={calculateRkapAchieved(
            actualTotalEmployeeCost,
            rkapData?.totalEmployeeCost ?? 0
          )}
          rkapYear={rkapData?.year}
          variant="dark"
        />
        <StatCard
          title="Total Cost"
          value={data.totalCost?.value || "N/A"}
          change={data.totalCost?.change || ""}
          valueUnit="Unit: Million"
          variant="dark"
        />
        <StatCard
          title="Cost per Employee"
          value={data.costPerEmployee.value}
          valueUnit="Unit: Million"
          change={data.costPerEmployee.change || ""}
          variant="light"
        />
        <StatCard
          title="Employee Cost Ratio"
          value={data.ratio.value}
          change={data.ratio.change || ""}
          variant="light"
        />
      </div>
      <div className="mt-6 space-y-6">
        {" "}
        {/* Tambahkan space-y-6 untuk jarak antar chart */}
        <EmployeeCostStackedChart />
        <EmployeeCostChartCard />
      </div>
    </section>
  );
};

export default EmployeeCostSection;
