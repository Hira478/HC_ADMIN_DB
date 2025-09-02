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
