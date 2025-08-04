import ProductivitySection from "@/components/sections/ProductivitySection";
import EmployeeCostSection from "@/components/sections/EmployeeCostSection";
import DemographySection from "@/components/sections/DemographySection";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <ProductivitySection />
      <EmployeeCostSection />
      <DemographySection />
    </div>
  );
}
