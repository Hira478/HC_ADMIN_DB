// File: ProductivitySection.tsx

"use client";

import StatCard from "@/components/widgets/StatCard"; // Pastikan path ini benar
import ProductivityChartCard from "@/components/widgets/ProductivityChartCard";
import KpiChartCard from "@/components/widgets/KpiChartCard";
import type { ProductivityCardData } from "@/types";

const ProductivitySection = ({
  data,
  loading,
}: {
  data: ProductivityCardData | undefined;
  loading: boolean;
}) => {
  if (loading) {
    // Tampilkan skeleton loading jika diperlukan
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
        <div className="text-center p-10">Memuat data produktivitas...</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
        <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
          Data produktivitas untuk periode ini tidak tersedia.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={data.revenue.value}
          valueUnit="Unit: Million Rupiah"
          change={data.revenue.change || ""}
          rkdapInfo="Revenue Key Data"
          variant="dark"
        />
        <StatCard
          title="Net Profit"
          value={data.netProfit.value}
          valueUnit="Unit: Million Rupiah"
          change={data.netProfit.change || ""}
          rkdapInfo="Net Profit Key Data"
          variant="dark"
        />
        <StatCard
          title="Revenue/Employee"
          value={data.revenuePerEmployee.value}
          valueUnit="Unit: Million Rupiah"
          change={data.revenuePerEmployee.change || ""}
          rkdapInfo="Revenue per Employee Key Data"
          variant="light"
        />
        <StatCard
          title="Net Profit/Employee"
          value={data.netProfitPerEmployee.value}
          valueUnit="Unit: Million Rupiah"
          change={data.netProfitPerEmployee.change || ""}
          rkdapInfo="Net Profit per Employee Key Data"
          variant="light"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-3 h-96">
          <ProductivityChartCard />
        </div>
        <div className="lg:col-span-1">
          <KpiChartCard />
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
