import React from "react";

const QuestionPalette = ({
  questions = [],
  currentQuestionIndex = 0,
  answers = {},
  markedForReview = [],
  visitedQuestions = [],
  onQuestionChange,
}) => {
  const getStatusClass = (index) => {
    const answered = answers[index] !== undefined && answers[index] !== null;
    const marked = markedForReview.includes(index);
    const visited = visitedQuestions.includes(index);

    if (answered && marked) return "bg-purple-600 text-white";
    if (marked) return "bg-yellow-500 text-white";
    if (answered) return "bg-green-600 text-white";
    if (visited) return "bg-red-500 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Question Palette</h3>
        <span className="text-xs text-gray-500">Current Section</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => (
          <button
            key={question?._id || index}
            type="button"
            onClick={() => onQuestionChange?.(index)}
            className={`h-9 rounded-lg text-sm font-semibold transition hover:scale-[1.02] ${
              getStatusClass(index)
            } ${
              index === currentQuestionIndex
                ? "ring-2 ring-[#064273] ring-offset-1"
                : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
        <div>🟢 Answered</div>
        <div>🔴 Visited</div>
        <div>🟡 Review</div>
        <div>🟣 Answered + Review</div>
      </div>
    </div>
  );
};

export default QuestionPalette;
