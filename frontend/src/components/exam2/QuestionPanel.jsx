import QuestionOptions from "./QuestionOptions";
import ExamNavigation from "./ExamNavigation";

export default function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  marked,
  toggleMark,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  sectionName = "Numerical Ability",
}) {
  if (!question) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No question available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Question Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Section:{" "}
            <span className="font-medium text-gray-700">
              {sectionName}
            </span>
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mt-1">
            Question {questionNumber}
            <span className="text-sm font-normal text-gray-500">
              {" "}of {totalQuestions}
            </span>
          </h2>
        </div>

        {/* Marks */}
        <div className="text-right">
          <div className="text-sm font-medium text-green-600">
            +{question.marks ?? 1} Marks
          </div>

          {question.negativeMarks > 0 && (
            <div className="text-xs text-red-500 mt-1">
              -{question.negativeMarks} Negative
            </div>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Question Text */}
        <div className="mb-6">
          <p className="text-base md:text-lg leading-7 text-gray-800">
            {question.question}
          </p>

          {/* Question Image / Graph / Diagram */}
          {question.questionImage && (
            <div className="mt-5">
              <img
                src={question.questionImage}
                alt={question.imageAlt || "Question diagram"}
                className="w-auto max-w-[500px] max-h-[280px] object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Options */}
        {question.type !== "coding" &&
          question.options?.length > 0 && (
            <QuestionOptions
              options={question.options}
              selectedAnswer={selectedAnswer}
              onAnswer={onAnswer}
            />
          )}

        {/* Coding Question */}
        {question.type === "coding" && (
          <div className="mt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Write your solution in the coding editor.
              </p>

              <textarea
                className="w-full min-h-[280px] p-4 bg-gray-900 text-green-400 rounded-md font-mono text-sm outline-none resize-y"
                placeholder="// Write your code here..."
                value={selectedAnswer || ""}
                onChange={(e) => onAnswer(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mark for Review */}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <button
            type="button"
            onClick={toggleMark}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition
              ${
                marked
                  ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <span className="text-base">
              {marked ? "★" : "☆"}
            </span>

            {marked ? "Marked for Review" : "Mark for Review"}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <ExamNavigation
          onPrevious={onPrevious}
          onNext={onNext}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>

    </div>
  );
}