"use client";

import StatCard from "@/components/widgets/StatCard";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";
import type { EmployeeCostCardData } from "@/types";

const EmployeeCostSection = ({
  data,
  loading,
}: {
  data: EmployeeCostCardData | undefined;
  loading: boolean;
}) => {
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        {/* Skeleton loading untuk 3 kartu */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
            <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
            <div className="bg-gray-700 p-6 rounded-lg shadow-md h-28 animate-pulse"></div>
          </div>
          <div className="lg:col-span-3 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
          Data biaya untuk periode ini tidak tersedia.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kolom Kiri: 3 Stat Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* KARTU 1: Total Employee Cost */}
          <StatCard
            title="Total Employee Cost"
            value={data.total.value}
            change={data.total.change || ""}
            valueUnit="Unit: Million Rupiah"
            rkdapInfo="Total Employee Cost Key Data"
            details={loremIpsum}
            variant="dark"
            className="flex-1"
          />
          {/* KARTU 2: Cost per Employee */}
          <StatCard
            title="Cost per Employee"
            value={data.costPerEmployee.value}
            valueUnit="Unit: Million Rupiah"
            change={data.costPerEmployee.change || ""}
            rkdapInfo="Cost per Employee Key Data"
            details={loremIpsum}
            variant="dark"
            className="flex-1"
          />
          {/* KARTU 3: Employee Cost Rasio */}
          <StatCard
            title="Employee Cost Rasio"
            value={data.ratio.value}
            change={data.ratio.change || ""}
            rkdapInfo="Employee Cost Rasio Key Data"
            details={loremIpsum}
            variant="dark"
            className="flex-1"
          />
        </div>

        {/* Kolom Kanan: Chart */}
        <div className="lg:col-span-3">
          <EmployeeCostChartCard />
        </div>
      </div>
    </section>
  );
};

export default EmployeeCostSection;
