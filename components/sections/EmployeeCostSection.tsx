// File: components/sections/EmployeeCostSection.tsx

"use client";

import StatCard from "@/components/widgets/StatCard";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";
import type { EmployeeCostCardData, RkapTargetData } from "@/types";

const calculateRkapAchieved = (actual: number, target: number): string => {
  if (target === 0) return "-";
  const achievement = (actual / target) * 100;
  return `${achievement.toFixed(1)}%`;
};

const EmployeeCostSection = ({
  data,
  loading,
  rkapData,
}: {
  data: EmployeeCostCardData | undefined;
  loading: boolean;
  rkapData: RkapTargetData | null;
}) => {
  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
        </div>
        <div className="mt-6 bg-gray-200 rounded-lg animate-pulse h-96"></div>
      </section>
    );
  }

  if (!data) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
          No Data.
        </div>
      </section>
    );
  }

  // PERUBAHAN: Hapus `actualTotalCost` yang tidak terpakai
  // dan hanya kalkulasi `actualTotalEmployeeCost` saat dibutuhkan
  const actualTotalEmployeeCost = data
    ? parseFloat(data.total.value.replace(/[^0-9-]/g, ""))
    : 0;

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="mt-6">
        <EmployeeCostChartCard />
      </div>
    </section>
  );
};

export default EmployeeCostSection;
