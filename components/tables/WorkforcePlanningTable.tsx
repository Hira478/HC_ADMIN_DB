// components/tables/WorkforcePlanningTable.tsx

import React from "react";
import { CogIcon } from "@heroicons/react/24/outline";

type StatusType = "Stretch" | "Fit" | "Overload";

// Data dummy sesuai mockup
const dummyData: {
  division: string;
  manPowerPlanning: number;
  headcount: number;
  rasio: string;
  status: StatusType;
}[] = [
  {
    division: "Sumber Daya Manusia",
    manPowerPlanning: 32,
    headcount: 30,
    rasio: "94%",
    status: "Stretch",
  },
  {
    division: "Keuangan",
    manPowerPlanning: 20,
    headcount: 20,
    rasio: "100%",
    status: "Fit",
  },
  {
    division: "Hukum",
    manPowerPlanning: 15,
    headcount: 11,
    rasio: "73%",
    status: "Overload",
  },
  {
    division: "Corporate Strategy",
    manPowerPlanning: 20,
    headcount: 18,
    rasio: "90%",
    status: "Stretch",
  },
];

// Helper untuk styling status
const getStatusClass = (status: StatusType) => {
  switch (status) {
    case "Fit":
      return "bg-green-100 text-green-800";
    case "Stretch":
      return "bg-yellow-100 text-yellow-800";
    case "Overload":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Pagination = () => (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700">
      1
    </button>
    <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-100">
      2
    </button>
    <button className="px-3 py-1 rounded-md text-sm text-white bg-gray-800">
      3
    </button>
    <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-100">
      4
    </button>
    <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-100">
      5
    </button>
    <span className="text-gray-500">...</span>
    <button className="px-3 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-100">
      20
    </button>
  </div>
);

const WorkforcePlanningTable = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Manpower Planning vs Headcount
        </h2>
        <CogIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left font-semibold text-gray-600 p-4">
                Division
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Man Power Planning
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Headcount
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Rasio
              </th>
              <th className="text-left font-semibold text-gray-600 p-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((row) => (
              <tr key={row.division} className="border-b">
                <td className="p-4 text-gray-800">{row.division}</td>
                <td className="p-4 text-gray-800">{row.manPowerPlanning}</td>
                <td className="p-4 text-gray-800">{row.headcount}</td>
                <td className="p-4 text-gray-800">{row.rasio}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </div>
  );
};

export default WorkforcePlanningTable;
