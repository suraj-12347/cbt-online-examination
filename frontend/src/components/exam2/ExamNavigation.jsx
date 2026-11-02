export default function ExamNavigation({
  onPrevious,
  onNext,
  isFirst = false,
  isLast = false,
}) {
  return (
    <div className="flex items-center justify-between w-full">

      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className={`
          inline-flex items-center gap-2
          px-5 py-2.5
          rounded-md
          border
          text-sm font-medium
          transition
          ${
            isFirst
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
          }
        `}
      >
        <span className="text-base">←</span>
        Previous
      </button>

      {/* Question Indicator */}
      <div className="hidden sm:flex items-center text-xs text-gray-500">
        Use Previous / Next to navigate
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className={`
          inline-flex items-center gap-2
          px-5 py-2.5
          rounded-md
          text-sm font-medium
          transition
          ${
            isLast
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }
        `}
      >
        {isLast ? "Finish" : "Save & Next"}
        {!isLast && <span className="text-base">→</span>}
      </button>

    </div>
  );
}