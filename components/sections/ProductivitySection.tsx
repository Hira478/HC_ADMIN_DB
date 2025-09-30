// File: components/sections/ProductivitySection.tsx
"use client";

import StatCard from "@/components/widgets/StatCard";
import ProductivityChartCard from "@/components/widgets/ProductivityChartCard";
import KpiTable from "@/components/tables/KpiTable";
import type {
  ProductivityCardData,
  GroupedChartData,
  RkapTargetData,
} from "@/types";

const calculateRkapAchieved = (actual: number, target: number): string => {
  if (target === 0) return "-";
  const achievement = (actual / target) * 100;
  return `${achievement.toFixed(1)}%`;
};

const ProductivitySection = ({
  cardData,
  kpiData,
  loadingCards,
  loadingKpi,
  rkapData,
}: {
  cardData: ProductivityCardData | null;
  rkapData: RkapTargetData | null;
  kpiData: GroupedChartData | null;
  loadingCards: boolean;
  loadingKpi: boolean;
}) => {
  // --- PERUBAHAN 1: Buat Skeleton UI untuk state loading ---
  if (loadingCards) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
        {/* Skeleton untuk 4 StatCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-[152px] animate-pulse"></div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md h-[152px] animate-pulse"></div>
          <div className="bg-gray-200 p-6 rounded-lg shadow-md h-[152px] animate-pulse"></div>
          <div className="bg-gray-200 p-6 rounded-lg shadow-md h-[152px] animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-6 mt-6">
          {/* Skeleton untuk ProductivityChartCard */}
          <div className="w-full bg-gray-200 rounded-lg animate-pulse h-[530px]"></div>
          {/* Skeleton untuk KpiTable */}
          <div className="w-full bg-gray-200 rounded-lg animate-pulse h-[300px]"></div>
        </div>
      </section>
    );
  }

  // --- PERUBAHAN 2: Perbaiki tampilan 'No Data' agar tidak resize ---
  if (!cardData) {
    return (
      <section>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Productivity</h1>
        {/* Tampilkan card dengan nilai default */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Revenue" value="N/A" variant="dark" />
          <StatCard title="Net Profit" value="N/A" variant="dark" />
          <StatCard title="Revenue/Employee" value="N/A" variant="light" />
          <StatCard title="Net Profit/Employee" value="N/A" variant="light" />
        </div>
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md h-[530px] flex items-center justify-center text-gray-500">
          No Chart Data Available.
        </div>
      </section>
    );
  }

  const actualRevenue = cardData
    ? parseFloat(cardData.revenue.value.replace(/[^0-9-]/g, ""))
    : 0;
  const actualNetProfit = cardData
    ? parseFloat(cardData.netProfit.value.replace(/[^0-9-]/g, ""))
    : 0;

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={cardData.revenue.value}
          valueUnit="Unit: Million"
          change={cardData.revenue.change || ""}
          rkdapInfo={calculateRkapAchieved(
            actualRevenue,
            rkapData?.revenue ?? 0
          )}
          rkapYear={rkapData?.year}
          variant="dark"
        />
        <StatCard
          title="Net Profit"
          value={cardData.netProfit.value}
          valueUnit="Unit: Million"
          change={cardData.netProfit.change || ""}
          rkdapInfo={calculateRkapAchieved(
            actualNetProfit,
            rkapData?.netProfit ?? 0
          )}
          rkapYear={rkapData?.year}
          variant="dark"
        />
        <StatCard
          title="Revenue/Employee"
          value={cardData.revenuePerEmployee.value}
          valueUnit="Unit: Million"
          change={cardData.revenuePerEmployee.change || ""}
          variant="light"
        />
        <StatCard
          title="Net Profit/Employee"
          value={cardData.netProfitPerEmployee.value}
          valueUnit="Unit: Million"
          change={cardData.netProfitPerEmployee.change || ""}
          variant="light"
        />
      </div>
      <div className="flex flex-col gap-6 mt-6">
        <div className="w-full">
          <ProductivityChartCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <KpiTable />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
