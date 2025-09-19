// app/(dashboard)/input/page.tsx
import { ArrowRight, Calendar, CalendarClock, Target } from "lucide-react";
import Link from "next/link";

const InputPortalPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Pusat Input Data</h1>
      <p className="mt-2 text-gray-600">
        Pilih jenis data yang ingin Anda masukkan atau perbarui.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opsi 1: Input Data Bulanan */}
        <Link
          href="/input/monthly"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarClock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Statistik Bulanan
              </h2>
              <p className="text-sm text-gray-500">
                Input untuk Headcount, Produktivitas, Biaya, dll.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>

        {/* Opsi 2: Input Data Tahunan */}
        <Link
          href="/input/yearly"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Skor Tahunan
              </h2>
              <p className="text-sm text-gray-500">
                Input untuk RKAP, HCMA, Culture Score, dll.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>
        <Link
          href="/input/rkap"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Target RKAP Tahunan
              </h2>
              <p className="text-sm text-gray-500">
                Input untuk target Revenue, Profit, dll.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default InputPortalPage;
