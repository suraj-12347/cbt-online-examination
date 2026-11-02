import React from "react";
import QuestionOptions from "./QuestionOptions";

const QuestionPanel = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
}) => {
  if (!question) {
    return (
      <main className="flex-1 bg-white flex items-center justify-center p-8 text-gray-500">
        No question available.
      </main>
    );
  }

  const questionImage = question.questionImage || question.image;

  return (
    <main className="flex-1 min-w-0 bg-white p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 border-b pb-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Question {questionNumber} of {totalQuestions || 0}
            </p>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">
              {question.topic || "Question"}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-gray-800">
              +{question.marks ?? 1} Marks
            </p>
            {Number(question.negativeMarks || 0) > 0 && (
              <p className="text-xs text-red-500">
                -{question.negativeMarks} for wrong answer
              </p>
            )}
          </div>
        </div>

        {questionImage && (
          <div className="mb-5 rounded-xl border bg-gray-50 p-3 flex justify-center">
            <img
              src={questionImage}
              alt={question.imageAlt || "Question"}
              className="max-w-full max-h-[360px] object-contain"
            />
          </div>
        )}

        <div className="text-gray-900 text-base md:text-lg leading-8 whitespace-pre-wrap mb-6">
          {question.question || question.text}
        </div>

        <QuestionOptions
          options={question.options || []}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      </div>
    </main>
  );
};

export default QuestionPanel;
