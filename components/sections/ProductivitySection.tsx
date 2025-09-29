// File: components/sections/ProductivitySection.tsx
"use client";

import StatCard from "@/components/widgets/StatCard";
import ProductivityChartCard from "@/components/widgets/ProductivityChartCard";
import KpiTable from "@/components/tables/KpiTable";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
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

// --- Perbarui props yang diterima ---
const ProductivitySection = ({
  cardData,
  kpiData,
  loadingCards,
  loadingKpi,
  rkapData,
}: {
  cardData: ProductivityCardData | null; // Terima data card
  rkapData: RkapTargetData | null;
  kpiData: GroupedChartData | null; // Terima data KPI
  loadingCards: boolean; // Terima status loading card
  loadingKpi: boolean; // Terima status loading KPI
}) => {
  // HAPUS SEMUA DATA DUMMY
  // const dummyGroupedChartData: GroupedChartData = { ... };

  // Kondisi loading sekarang lebih spesifik
  if (loadingCards) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
        <div className="text-center p-10">Loading productivity cards...</div>
      </section>
    );
  }

  if (!cardData) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
        <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
          No Productivity Data.
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
      {/* Bagian StatCard menggunakan 'cardData' */}
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
            {/* GroupedBarChart sekarang menggunakan data asli dan status loading-nya */}
            {/* 1. GroupedBarChart di-comment atau dihapus */}
            {/*
              <GroupedBarChart
                data={kpiData}
                isLoading={loadingKpi}
                showSummary={true}
                cardClassName="bg-white text-gray-800"
                tooltipText="Perbandingan rata-rata skor KPI tahun ini dengan tahun sebelumnya."
                summaryUnit="Unit: Percentage"
                layoutMode="wide"
                summaryFormat="percentage"
              />
            */}

            {/* 2. Tambahkan komponen KpiTable yang baru */}
            <KpiTable />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
