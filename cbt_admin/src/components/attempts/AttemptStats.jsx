import React from "react";
import {
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const AttemptStats = ({ attempts = [] }) => {
  const totalAttempts = attempts.length;

  const activeAttempts = attempts.filter(
    (attempt) => attempt.status === "started"
  ).length;

  const completedAttempts = attempts.filter(
    (attempt) => attempt.status === "completed"
  ).length;

  const expiredAttempts = attempts.filter(
    (attempt) => attempt.status === "expired"
  ).length;

  const stats = [
    {
      title: "Total Attempts",
      value: totalAttempts,
      icon: ClipboardList,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "In Progress",
      value: activeAttempts,
      icon: PlayCircle,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: completedAttempts,
      icon: CheckCircle2,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Expired",
      value: expiredAttempts,
      icon: Clock3,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className={`rounded-xl border border-gray-200 p-5 shadow-sm ${stat.bg}`}
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

export default AttemptStats;