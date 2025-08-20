// app/workforce-planning/page.tsx

import SummaryCard from "@/components/ui/SummaryCard";
import WorkforcePlanningTable from "@/components/tables/WorkforcePlanningTable";
import StatCard from "@/components/ui/StatCard"; // <-- 1. Impor komponen baru
import AreaLineChart from "@/components/charts/AreaLineChart"; // <-- 2. Impor chart yang sudah ada
import TurnOverChart from "@/components/charts/TurnOverChart";
import NotesList from "@/components/ui/NotesList";

export default function WorkforcePlanningPage() {
  // 3. Siapkan data dummy untuk chart di Section 2
  const newEmployeeData = {
    categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    data: [3, 5, 3, 2, 3],
  };

  const costOfHireData = {
    categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    data: [50, 70, 45, 43, 57],
  };

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Workforce Planning
      </h1>

      {/* --- SECTION 1: Manpower Planning vs Headcount --- */}
      <div className="flex flex-col md:flex-row gap-6">
        <SummaryCard
          title="Total Manpower Planning"
          value="621"
          unit="Employee"
          trend="+2% | Year on Year"
        />
        <SummaryCard
          title="Total Headcount"
          value="600"
          unit="Employee"
          trend="+0% | Year on Year"
        />
        <SummaryCard title="Fulfilment" value="89.2%" />
      </div>
      <WorkforcePlanningTable />

      {/* --- SECTION 2: Talent Acquisition --- */}
      {/* --- SECTION 2: Talent Acquisition --- */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Talent Acquisition
        </h2>
        {/* Beri 'items-stretch' agar kolom memiliki tinggi yang sama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Kolom Kiri: Stat Cards */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <StatCard title="Total Hire" value={16} unit="Employee" />
            <StatCard title="Total Cost Hire" value={350} unit="Juta" />
            <StatCard title="New Hire Retention" value="70%" unit="" />
            <StatCard title="Quality of Hire" value="70%" unit="" />
          </div>

          {/* Kolom Kanan: Charts */}
          {/* Pastikan container ini mengisi tinggi kolom grid */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full">
            <AreaLineChart
              title="New Employee"
              subtitle="2025"
              chartData={newEmployeeData}
              containerClassName="bg-gray-50 flex-1" // Tambahkan flex-1 di sini
              isLoading={false}
            />
            <AreaLineChart
              title="Cost of Hire"
              subtitle="2025"
              chartData={costOfHireData}
              containerClassName="bg-gray-50 flex-1" // Dan di sini juga
              isLoading={false}
            />
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Turn Over</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TurnOverChart />
          <NotesList />
        </div>
      </div>
    </main>
  );
}
