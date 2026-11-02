import React from "react";
import {
  Eye,
  UserRound,
  FileText,
} from "lucide-react";

const ResultsTable = ({
  results = [],
  onView,
}) => {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <FileText
          size={42}
          className="mx-auto text-gray-300"
        />

        <h3 className="mt-4 text-lg font-semibold text-gray-700">
          No Results Found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          No result records match the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Student
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Exam
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Questions
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Marks
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Percentage
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Result
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Completed At
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {results.map((result) => {
              const student = result.userId || {};
              const exam = result.examId || {};

              return (
                <tr
                  key={result._id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Student */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={student.name || "Student"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound
                            size={18}
                            className="text-blue-600"
                          />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {student.name || "-"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {student.rollNo ||
                            student.email ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Exam */}
                  <td className="px-5 py-4">
                    <p className="max-w-[220px] truncate font-medium text-gray-800">
                      {exam.title || "-"}
                    </p>
                  </td>

                  {/* Questions */}
                  <td className="px-5 py-4 text-center">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">
                        {result.attempted || 0}
                      </span>
                      <span className="text-gray-400">
                        {" "}
                        / {result.totalQuestions || 0}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      {result.correct || 0} correct
                    </p>
                  </td>

                  {/* Marks */}
                  <td className="px-5 py-4 text-center">
                    <p className="font-semibold text-gray-800">
                      {result.obtainedMarks ?? 0}
                    </p>

                    <p className="text-xs text-gray-400">
                      / {result.maxMarks ?? 0}
                    </p>
                  </td>

                  {/* Percentage */}
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold text-gray-800">
                      {Number(
                        result.percentage || 0
                      ).toFixed(2)}
                      %
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        result.status
                      )}`}
                    >
                      {result.status || "pending"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {formatDate(
                      result.calculatedAt ||
                        result.createdAt
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onView(result)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;