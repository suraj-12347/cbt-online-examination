import React from "react";

const ExamNavigation = ({
  currentQuestionIndex = 0,
  totalQuestions = 0,
  onPrevious,
  onNext,
  onMarkReview,
  onClearResponse,
  onSubmit,
}) => {
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex >= totalQuestions - 1;

  return (
    <div className="sticky bottom-0 z-20 border-t bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-3px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={onPrevious}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onClearResponse}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear Response
          </button>

          <button
            type="button"
            onClick={onMarkReview}
            className="px-4 py-2 border border-yellow-400 text-yellow-700 bg-yellow-50 rounded-lg text-sm font-semibold hover:bg-yellow-100"
          >
            Mark for Review & Next
          </button>
        </div>

        <div className="flex gap-2">
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2 bg-[#064273] text-white rounded-lg text-sm font-semibold hover:bg-[#05365f]"
            >
              Save & Next →
            </button>
          ) : (
            <button
              type="button"
              // onClick={onSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              wait here
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamNavigation;
