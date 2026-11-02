
import {
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  Clock3,
  CheckCircle,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "1,250",
    icon: Users,
  },
  {
    title: "Total Exams",
    value: "24",
    icon: FileText,
  },
  {
    title: "Total Attempts",
    value: "3,480",
    icon: ClipboardList,
  },
  {
    title: "Completed",
    value: "2,950",
    icon: CheckCircle,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white border-b px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Admin
        </p>
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-200
                           p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-2">
                    {item.value}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-lg bg-blue-50
                                text-blue-600 flex items-center justify-center">
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Active Exams */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Active Exams
              </h2>

              <Clock3 size={20} className="text-blue-600" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium text-gray-700">
                    Campus Recruitment
                  </p>
                  <p className="text-xs text-gray-500">
                    50 Questions
                  </p>
                </div>

                <span className="px-3 py-1 text-xs rounded-full
                                 bg-green-100 text-green-700">
                  Active
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">
                    Technical Assessment
                  </p>
                  <p className="text-xs text-gray-500">
                    40 Questions
                  </p>
                </div>

                <span className="px-3 py-1 text-xs rounded-full
                                 bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Results
              </h2>

              <BarChart3 size={20} className="text-blue-600" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-700">
                    Rahul Sharma
                  </p>
                  <p className="text-xs text-gray-500">
                    Campus Recruitment
                  </p>
                </div>

                <span className="font-semibold text-gray-700">
                  82%
                </span>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-700">
                    Priya Singh
                  </p>
                  <p className="text-xs text-gray-500">
                    Technical Assessment
                  </p>
                </div>

                <span className="font-semibold text-gray-700">
                  76%
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

