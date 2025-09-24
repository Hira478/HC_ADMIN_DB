// types/index.ts

// Tipe dasar dari context
export interface Period {
  type: "monthly" | "quarterly" | "semesterly" | "yearly";
  year: number;
  value: number;
}

export interface Company {
  id: number;
  name: string;
}

// Tipe untuk data chart standar (label & value)
export interface ChartData {
  labels: string[];
  values: number[];
}

// Tipe untuk data chart status (pie/donut)
export interface StatusData {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

// Tipe untuk data kartu headcount
export interface HeadcountData {
  total: number;
  male: number;
  female: number;
}

// Tipe untuk data kartu productivity & employee cost
export interface MetricData {
  value: string;
  change?: string;
}

export interface ProductivityCardData {
  revenue: MetricData;
  netProfit: MetricData;
  revenuePerEmployee: MetricData;
  netProfitPerEmployee: MetricData;
}

export interface EmployeeCostCardData {
  total: MetricData;
  costPerEmployee: MetricData; // <-- Ganti nama dari 'ratio'
  ratio: MetricData; // <-- Tambahkan properti baru
}

// Tipe gabungan untuk semua data demografi yang di-fetch oleh page.tsx
export interface DemographyData {
  headcount: HeadcountData;
  status: StatusData[];
  education: ChartData;
  level: ChartData;
  age: ChartData;
  los: ChartData; // Length of Service
}

// Tipe data utama untuk state di page.tsx
export interface DashboardData {
  productivity: ProductivityCardData;
  employeeCost: EmployeeCostCardData;
  demography: DemographyData;
}

export interface TurnoverData {
  ytdRatio: number;
  change: string;
  chartData: {
    categories: string[];
    data: number[];
  };
}

export interface HcmaData {
  title: string;
  mainScore: number; // Ini adalah Average Score perusahaan
  scoreLabel: string;
  trend: string;
  ifgAverageScore: number; // Ini adalah Average Score Grup IFG
  chartData: {
    categories: string[];
    seriesPrevYear: number[];
    seriesCurrYear: number[];
  };
  prevYear: number | null;
  currYear: number;
}

// TIPE STANDAR BARU UNTUK SEMUA GROUPED BAR CHART
export interface GroupedChartData {
  title: string;
  mainScore: number; // Standarkan menjadi 'number'
  scoreLabel: string;
  trend: string;
  chartData: {
    categories: string[];
    seriesPrevYear: number[];
    seriesCurrYear: number[];
  };
  prevYear: number | null;
  currYear: number;
}

// Tipe untuk setiap baris di tabel Formation Rasio vs Market
export interface FormationRasioTableRow {
  jobFamily: string;
  rasio: string;
  market: string;
  rasioGap: number;
}

// Tipe untuk keseluruhan data tabel Formation Rasio, termasuk paginasi
export interface FormationRasioTableData {
  data: FormationRasioTableRow[];
  meta: {
    currentPage: number;
    totalPages: number;
  };
}

export interface OrgStructureData {
  formationRatioCard: {
    enabler: number;
    revenueGenerator: number;
  };
  designOrgCard: {
    division: number;
    department: number;
  };
}

// TAMBAHKAN INI KE types/index.ts
export interface OrganizationHealthData {
  categories: string[];
  currentYear: number;
  previousYear: number | null;
  currentYearData: number[];
  previousYearData: number[];
  currentYearScore: number;
  previousYearScore: number | null;
}

// --- TIPE BARU UNTUK DATA TARGET RKAP ---
export interface RkapTargetData {
  year: number;
  revenue: number;
  netProfit: number;
  totalEmployeeCost: number;
}
