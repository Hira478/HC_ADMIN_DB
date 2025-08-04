import StatCard from "@/components/widgets/StatCard";
import ProductivityChartCard from "@/components/widgets/ProductivityChartCard";
import KpiChartCard from "@/components/widgets/KpiChartCard";
import { DollarSign, User, TrendingUp } from "lucide-react";

const ProductivitySection = () => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Productivity</h2>

      {/* Baris Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value="Rp. 999999 M"
          change="+10% | Year on Year"
          comparison=""
          rkdapInfo="70% | RKAP 2025"
          icon={<DollarSign size={24} />}
          variant="dark"
          notificationCount={3}
        />
        <StatCard
          title="Net Profit"
          value="Rp. 34.2 M"
          change="+2% | Year on Year"
          comparison=""
          rkdapInfo="70% | RKAP 2025"
          icon={<DollarSign size={24} />}
          variant="dark"
        />
        <StatCard
          title="Revenue/Employee"
          value="Rp. 13M"
          change="+2% | Year on Year"
          comparison=""
          rkdapInfo=""
          icon={<User size={24} />}
          variant="light"
        />
        <StatCard
          title="Net Profit/Employee"
          value="Rp. 1.9 M"
          change="+1% | Year on Year"
          comparison=""
          rkdapInfo=""
          icon={<TrendingUp size={24} />}
          variant="light"
        />
      </div>

      {/* Baris Chart (Productivity & KPI) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
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
