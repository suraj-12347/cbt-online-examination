export default function SectionSummary({
  totalQuestions = 0,
  answeredCount = 0,
  markedCount = 0,
  visitedCount = 0,
}) {
  const notAnswered = Math.max(
    totalQuestions - answeredCount,
    0
  );

  const notVisited = Math.max(
    totalQuestions - visitedCount,
    0
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">
          Section Summary
        </h3>
      </div>

      {/* Summary */}
      <div className="p-4 space-y-3">

        {/* Total Questions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Total Questions
          </span>

          <span className="font-semibold text-gray-800">
            {totalQuestions}
          </span>
        </div>

        {/* Answered */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>

            <span className="text-sm text-gray-600">
              Answered
            </span>
          </div>

          <span className="font-semibold text-green-600">
            {answeredCount}
          </span>
        </div>

        {/* Not Answered */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-300"></span>

            <span className="text-sm text-gray-600">
              Not Answered
            </span>
          </div>

          <span className="font-semibold text-gray-600">
            {notAnswered}
          </span>
        </div>

        {/* Marked */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>

            <span className="text-sm text-gray-600">
              Marked for Review
            </span>
          </div>

          <span className="font-semibold text-yellow-600">
            {markedCount}
          </span>
        </div>

        {/* Not Visited */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white border border-gray-400"></span>

            <span className="text-sm text-gray-600">
              Not Visited
            </span>
          </div>

          <span className="font-semibold text-gray-500">
            {notVisited}
          </span>
        </div>

      </div>

      {/* Progress */}
      <div className="px-4 pb-4">

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Progress
          </span>

          <span className="text-xs font-medium text-gray-700">
            {totalQuestions > 0
              ? Math.round(
                  (answeredCount / totalQuestions) * 100
                )
              : 0}
            %
          </span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${
                totalQuestions > 0
                  ? (answeredCount / totalQuestions) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>

      </div>

    </div>
  );
}