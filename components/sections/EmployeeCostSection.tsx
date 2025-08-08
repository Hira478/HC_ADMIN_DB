"use client";

import StatCard from "@/components/widgets/StatCard";
import { DollarSign, Divide } from "lucide-react";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";
import type { EmployeeCostCardData } from "@/types";

const EmployeeCostSection = ({
  data,
  loading,
}: {
  data: EmployeeCostCardData | undefined;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Cost</h2>
        <div className="text-center p-10">Memuat data biaya...</div>
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
        {/* Kolom Kiri: 2 Stat Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <StatCard
            title="Total Employee Cost"
            value={data.total.value}
            change="+10% | Year on Year"
            comparison="" // <-- Tambahkan ini
            rkdapInfo=""
            icon={<DollarSign size={24} />}
            variant="dark"
            className="flex-1" // <-- Tambahkan className="flex-1"
          />
          <StatCard
            title="Employee Cost Rasio"
            value={data.ratio.value}
            change="+1% | Year on Year"
            comparison="" // <-- Tambahkan ini
            rkdapInfo=""
            icon={<Divide size={24} />}
            variant="dark"
            className="flex-1" // <-- Tambahkan className="flex-1"
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
