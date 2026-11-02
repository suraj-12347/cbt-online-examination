export default function QuestionPalette({
  questions = [],
  currentQuestionId,
  answers = {},
  markedQuestions = [],
  visitedQuestions = [],
  onQuestionClick,
}) {
  const getQuestionStatus = (question) => {
    const isCurrent = question.id === currentQuestionId;
    const isAnswered =
      answers[question.id] !== undefined &&
      answers[question.id] !== null &&
      answers[question.id] !== "";

    const isMarked = markedQuestions.includes(question.id);
    const isVisited = visitedQuestions.includes(question.id);

    if (isCurrent) {
      return "bg-blue-600 text-white border-blue-600";
    }

    if (isMarked && isAnswered) {
      return "bg-purple-600 text-white border-purple-600";
    }

    if (isMarked) {
      return "bg-yellow-400 text-gray-900 border-yellow-400";
    }

    if (isAnswered) {
      return "bg-green-500 text-white border-green-500";
    }

    if (isVisited) {
      return "bg-gray-200 text-gray-700 border-gray-300";
    }

    return "bg-white text-gray-600 border-gray-300";
  };

  const getStatusLabel = (question) => {
    const isAnswered =
      answers[question.id] !== undefined &&
      answers[question.id] !== null &&
      answers[question.id] !== "";

    const isMarked = markedQuestions.includes(question.id);

    if (isMarked && isAnswered) return "Answered & Marked";
    if (isMarked) return "Marked for Review";
    if (isAnswered) return "Answered";

    return "Not Answered";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">
          Question Palette
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          Navigate to any question
        </p>
      </div>

      {/* Palette */}
      <div className="p-4">

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              title={`Question ${index + 1} - ${getStatusLabel(
                question
              )}`}
              onClick={() => onQuestionClick(question.id)}
              className={`
                h-9 w-9
                rounded-md
                border
                text-xs
                font-semibold
                flex
                items-center
                justify-center
                transition
                hover:scale-105
                focus:outline-none
                focus:ring-2
                focus:ring-blue-300
                ${getQuestionStatus(question)}
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>

      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">

        <div className="grid grid-cols-2 gap-y-3 text-xs">

          {/* Answered */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500"></span>
            <span className="text-gray-600">
              Answered
            </span>
          </div>

          {/* Not Answered */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded border border-gray-300 bg-white"></span>
            <span className="text-gray-600">
              Not Answered
            </span>
          </div>

          {/* Marked */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-400"></span>
            <span className="text-gray-600">
              Marked
            </span>
          </div>

          {/* Answered + Marked */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-purple-600"></span>
            <span className="text-gray-600">
              Answered & Marked
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}