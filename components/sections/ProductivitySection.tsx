"use client";

import StatCard from "@/components/widgets/StatCard";
import ProductivityChartCard from "@/components/widgets/ProductivityChartCard";
import KpiChartCard from "@/components/widgets/KpiChartCard";
import { DollarSign, User, TrendingUp } from "lucide-react";
import type { ProductivityCardData } from "@/types";

// Terima 'data' dan 'loading' sebagai props
const ProductivitySection = ({
  data,
  loading,
}: {
  data: ProductivityCardData | undefined;
  loading: boolean;
}) => {
  // Return lebih awal jika loading atau data tidak ada
  if (loading) {
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

  // Kode di bawah ini hanya akan berjalan jika loading=false DAN data=ada
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={data.revenue.value}
          change="+10% | Year on Year"
          rkdapInfo=""
          icon={<DollarSign size={24} />}
          variant="dark"
        />
        <StatCard
          title="Net Profit"
          value={data.netProfit.value}
          change="+2% | Year on Year"
          rkdapInfo=""
          icon={<DollarSign size={24} />}
          variant="dark"
        />
        <StatCard
          title="Revenue/Employee"
          value={data.revenuePerEmployee.value}
          change="+2% | Year on Year"
          rkdapInfo=""
          icon={<User size={24} />}
          variant="light"
        />
        <StatCard
          title="Net Profit/Employee"
          value={data.netProfitPerEmployee.value}
          change="+1% | Year on Year"
          rkdapInfo=""
          icon={<TrendingUp size={24} />}
          variant="light"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-3">
          {" "}
          <ProductivityChartCard />{" "}
        </div>
        <div className="lg:col-span-1">
          {" "}
          <KpiChartCard />{" "}
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
