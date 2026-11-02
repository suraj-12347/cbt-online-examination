import React from "react";
import {
  Eye,
  User,
  CalendarDays,
} from "lucide-react";

const AttemptsTable = ({
  attempts = [],
  loading,
  onView,
}) => {
  const getStatus = (status) => {
    const styles = {
      started:
        "bg-amber-100 text-amber-700",
      completed:
        "bg-green-100 text-green-700",
      expired:
        "bg-red-100 text-red-700",
      abandoned:
        "bg-gray-100 text-gray-700",
    };

    const labels = {
      started: "In Progress",
      completed: "Completed",
      expired: "Expired",
      abandoned: "Abandoned",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[status] ||
          "bg-gray-100 text-gray-600"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Loading attempts...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Student
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Exam
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Started
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Submitted
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Score
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Accuracy
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {attempts.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <CalendarDays
                        size={22}
                        className="text-gray-400"
                      />
                    </div>

                    <p className="font-medium text-gray-700">
                      No attempts found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Student attempts will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              attempts.map((attempt) => {
                const student =
                  attempt.userId;

                const exam =
                  attempt.examId;

                return (
                  <tr
                    key={attempt._id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                          <User
                            size={17}
                            className="text-blue-600"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {student?.name ||
                              "Unknown Student"}
                          </p>

                          <p className="text-xs text-gray-400">
                            {student?.rollNo ||
                              student?.email ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Exam */}
                    <td className="px-5 py-4">
                      <p className="max-w-[220px] truncate text-sm font-medium text-gray-700">
                        {exam?.title ||
                          "Unknown Exam"}
                      </p>
                    </td>

                    {/* Started */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        attempt.startedAt
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        attempt.submittedAt
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {getStatus(
                        attempt.status
                      )}
                    </td>

                    {/* Score */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-800">
                        {attempt.obtainedMarks ??
                          0}
                      </span>

                      <span className="text-xs text-gray-400">
                        {" "}
                        /{" "}
                        {attempt.totalMarks ??
                          0}
                      </span>
                    </td>

                    {/* Accuracy */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {attempt.accuracy ??
                        0}
                      %
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            attempt._id
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttemptsTable;