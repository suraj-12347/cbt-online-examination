export default function QuestionOptions({
  options = [],
  selectedAnswer,
  onAnswer,
}) {
  if (!options || options.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500">
        No options available for this question.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((option, index) => {
        const optionLetter = String.fromCharCode(65 + index);

        const optionText =
          typeof option === "string" ? option : option.text;

        const optionImage =
          typeof option === "object" ? option.image : null;

        const isSelected = selectedAnswer === index;

        return (
          <div
            key={index}
            onClick={() => onAnswer(index)}
            className={`
              group flex items-start gap-4 w-full p-4 rounded-lg
              border cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
              }
            `}
          >
            {/* Option Letter */}
            <span
              className={`
                flex items-center justify-center
                w-9 h-9 min-w-[36px]
                rounded-full border text-sm font-semibold
                ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 group-hover:border-blue-400"
                }
              `}
            >
              {optionLetter}
            </span>

            {/* Option Content */}
            <div className="flex-1">
              {optionText && (
                <div
                  className={`text-sm md:text-base leading-6 ${
                    isSelected
                      ? "text-blue-800 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {optionText}
                </div>
              )}

              {/* Option Image */}
              {optionImage && (
                <img
                  src={optionImage}
                  alt={`Option ${optionLetter}`}
                  className="mt-3 w-auto max-w-[280px] max-h-[160px] object-contain rounded-md border border-gray-200"
                />
              )}
            </div>

            {/* Selected Tick */}
            <span
              className={`
                ml-auto flex items-center justify-center
                w-6 h-6 rounded-full text-xs
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-transparent"
                }
              `}
            >
              ✓
            </span>
          </div>
        );
      })}
    </div>
  );
}