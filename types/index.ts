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
  costPerEmployee: MetricData;
  ratio: MetricData;
  totalCost?: MetricData; // PERUBAHAN: Tambahkan properti opsional totalCost
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
  scoreInfo: {
    text: string;
    colorClass: string;
  };
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

export interface StackedChartData {
  labels: string[];
  datasets: {
    managementCost: number[];
    employeeCost: number[];
    recruitment: number[];
    secondment: number[];
    others: number[];
  };
}

// --- TIPE UNTUK DEMOGRAFI (SKEMA BARU) ---

// Digunakan oleh komponen Card/Chart di frontend untuk menampilkan data.
// Ini adalah bentuk data yang dikembalikan oleh API /api/demography/*

export interface HeadcountApiData {
  total: number;
  permanent: {
    total: number;
    male: number;
    female: number;
  };
  contract: {
    total: number;
    male: number;
    female: number;
  };
  change?: string;
}

// Tipe data umum untuk semua chart demografi (Age, Education, Level, LoS)
interface DemographyChartDataset {
  label: string;
  values: number[];
}

export interface DemographyChartApiData {
  labels: string[];
  permanent: DemographyChartDataset;
  contract: DemographyChartDataset;
  total: DemographyChartDataset;
}

// --- TIPE UNTUK FORM INPUT MANUAL DEMOGRAFI ---

// Tipe untuk payload yang dikirim dari form input manual
// ke API POST /api/demography/manual-input
export interface DemographyManualInputPayload {
  year: number;
  month: number;
  companyId: number;
  statusType: "permanent" | "contract";

  headcount?: { male: number; female: number };
  education?: {
    sd: number; // <-- Tambahkan ini
    smp: number;
    smaSmk: number;
    d3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  level?: { bod1: number; bod2: number; bod3: number; bod4: number };
  age?: {
    under25: number;
    age26to40: number;
    age41to50: number;
    over50: number;
  };
  lengthOfService?: {
    los_0_5: number;
    los_6_10: number;
    los_11_15: number;
    los_16_20: number;
    los_21_25: number;
    los_25_30: number;
    los_over_30: number;
  };
}

// Tipe untuk data yang diterima dari API GET /api/demography/manual-input
// Ini akan berisi data mentah dari database untuk mengisi form.
// Pastikan Anda sudah menjalankan `npx prisma generate`
import type {
  Headcount,
  EducationStat,
  LevelStat,
  AgeStat,
  LengthOfServiceStat,
} from "@prisma/client";

export interface DemographyManualInputData {
  headcount: Headcount | null;
  education: EducationStat | null;
  level: LevelStat | null;
  age: AgeStat | null;
  lengthOfService: LengthOfServiceStat | null;
}
