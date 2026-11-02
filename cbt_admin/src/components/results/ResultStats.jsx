import React from "react";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";

const ResultStats = ({ results = [] }) => {
  const totalResults = results.length;

  const passedResults = results.filter(
    (result) => result.status === "passed"
  ).length;

  const failedResults = results.filter(
    (result) => result.status === "failed"
  ).length;

  const averagePercentage =
    totalResults > 0
      ? (
          results.reduce(
            (total, result) =>
              total + Number(result.percentage || 0),
            0
          ) / totalResults
        ).toFixed(2)
      : 0;

  const stats = [
    {
      title: "Total Results",
      value: totalResults,
      icon: FileCheck2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Passed",
      value: passedResults,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Failed",
      value: failedResults,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Average Score",
      value: `${averagePercentage}%`,
      icon: Percent,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconBg}`}
              >
                <Icon
                  size={22}
                  className={stat.iconColor}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultStats;