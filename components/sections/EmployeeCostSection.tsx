"use client";

import StatCard from "@/components/widgets/StatCard";
import EmployeeCostChartCard from "@/components/widgets/EmployeeCostChartCard";
import type { EmployeeCostCardData, RkapTargetData } from "@/types";

const calculateRkapAchieved = (actual: number, target: number): string => {
  if (target === 0) return "-";
  // Untuk biaya, pencapaian yang lebih rendah itu lebih baik.
  // Jadi jika aktual > target, persentasenya > 100% (kurang baik).
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
  rkapData: RkapTargetData | null; // <-- TIPE PROP BARU
}) => {
  const totalEmployeCostDetails =
    "Total biaya beban karyawan yang dikeluarkan perusahaan pada periode tertentu  (gaji, incentive, PPH 21, training, rekrutment & beban karyawan lainnya).";
  const constPerEmployeeDetails =
    "Besaran biaya rata-rata yang dikeluarkan perusahaan untuk setiap karyawan dalam periode tertentu.";
  const employeeCostRasioDetails =
    "Besaran porsi biaya karyawan dibandingkan dengan biaya operasioan perusahaan.";
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
          No Data.
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kolom Kiri: 3 Stat Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* KARTU 1: Total Employee Cost */}
          <StatCard
            title="Total Employee Cost"
            value={data.total.value}
            change={data.total.change || ""}
            valueUnit="Unit: Million"
            rkdapInfo={calculateRkapAchieved(
              actualTotalEmployeeCost,
              rkapData?.totalEmployeeCost ?? 0
            )}
            details={totalEmployeCostDetails}
            variant="dark"
            className="flex-1"
            rkapYear={rkapData?.year}
          />
          {/* KARTU 2: Cost per Employee */}
          <StatCard
            title="Cost per Employee"
            value={data.costPerEmployee.value}
            valueUnit="Unit: Million"
            change={data.costPerEmployee.change || ""}
            details={constPerEmployeeDetails}
            variant="dark"
            className="flex-1"
          />
          {/* KARTU 3: Employee Cost Rasio */}
          <StatCard
            title="Employee Cost Rasio"
            value={data.ratio.value}
            change={data.ratio.change || ""}
            details={employeeCostRasioDetails}
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
