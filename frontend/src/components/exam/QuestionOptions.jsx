import React from "react";

const QuestionOptions = ({
  options = [],
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const optionText =
          typeof option === "string" ? option : option?.text || "";

        const optionImage =
          typeof option === "object" ? option?.image : null;

        const selected = selectedAnswer === index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onAnswerChange?.(index)}
            className={`w-full text-left border rounded-lg p-3 flex items-start gap-3 transition ${
              selected
                ? "border-[#064273] bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <span
              className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-sm font-semibold ${
                selected
                  ? "bg-[#064273] text-white border-[#064273]"
                  : "bg-white text-gray-700"
              }`}
            >
              {String.fromCharCode(65 + index)}
            </span>

            <div className="flex-1">
              {optionText && (
                <p className="text-gray-800">{optionText}</p>
              )}

              {optionImage && (
                <img
                  src={optionImage}
                  alt={`Option ${String.fromCharCode(65 + index)}`}
                  className="mt-2 max-w-[220px] max-h-32 object-contain"
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuestionOptions;
