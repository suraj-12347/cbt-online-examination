// src/pages/ExamPage.jsx

import { useMemo, useState } from "react";

import ExamHeader from "../components/exam/ExamHeader";
import SectionSidebar from "../components/exam/SectionSidebar";
import QuestionPanel from "../components/exam/QuestionPanel";
import QuestionPalette from "../components/exam/QuestionPalette";
import SectionSummary from "../components/exam/SectionSummary";

import ResultPage from "./ResultPage";

import {examData} from "../data/examData";

export default function ExamPage() {
  // ==================================================
  // BASIC EXAM DATA
  // ==================================================

  const sections = examData.sections || [];
  const questions = examData.questions || [];

  const firstSection = sections[0];

  const firstSectionQuestions = questions.filter(
    (question) => question.sectionId === firstSection?.id
  );

  const firstQuestion = firstSectionQuestions[0];

  // ==================================================
  // EXAM STATE
  // ==================================================

  const [examCompleted, setExamCompleted] = useState(false);

  const [currentSectionId, setCurrentSectionId] = useState(
    firstSection?.id
  );

  const [currentQuestionId, setCurrentQuestionId] = useState(
    firstQuestion?.id
  );

  // Answers
  const [answers, setAnswers] = useState({});

  // Marked questions
  const [markedQuestions, setMarkedQuestions] = useState([]);

  // Visited questions
  const [visitedQuestions, setVisitedQuestions] = useState(
    firstQuestion ? [firstQuestion.id] : []
  );

  // Completed sections
  const [completedSections, setCompletedSections] = useState([]);

  // ==================================================
  // CURRENT SECTION
  // ==================================================

  const currentSection = useMemo(() => {
    return sections.find(
      (section) => section.id === currentSectionId
    );
  }, [currentSectionId, sections]);

  // ==================================================
  // CURRENT SECTION QUESTIONS
  // ==================================================

  const currentSectionQuestions = useMemo(() => {
    return questions.filter(
      (question) => question.sectionId === currentSectionId
    );
  }, [questions, currentSectionId]);

  // ==================================================
  // CURRENT QUESTION
  // ==================================================

  const currentQuestion = useMemo(() => {
    return questions.find(
      (question) => question.id === currentQuestionId
    );
  }, [questions, currentQuestionId]);

  // ==================================================
  // CURRENT QUESTION INDEX
  // ==================================================

  const currentQuestionIndex = currentSectionQuestions.findIndex(
    (question) => question.id === currentQuestionId
  );

  // Question number
  const questionNumber =
    currentQuestionIndex >= 0
      ? currentQuestionIndex + 1
      : 1;

  // ==================================================
  // SECTION INDEX
  // ==================================================

  const currentSectionIndex = sections.findIndex(
    (section) => section.id === currentSectionId
  );

  const isFirstQuestion = currentQuestionIndex === 0;

  const isLastQuestion =
    currentQuestionIndex === currentSectionQuestions.length - 1;

  const isLastSection =
    currentSectionIndex === sections.length - 1;

  // ==================================================
  // ANSWER HANDLER
  // ==================================================

  const handleAnswer = (answer) => {
    if (!currentQuestion) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: answer,
    }));
  };

  // ==================================================
  // MARK / UNMARK QUESTION
  // ==================================================

  const toggleMark = () => {
    if (!currentQuestion) return;

    setMarkedQuestions((previous) => {
      if (previous.includes(currentQuestion.id)) {
        return previous.filter(
          (id) => id !== currentQuestion.id
        );
      }

      return [...previous, currentQuestion.id];
    });
  };

  // ==================================================
  // VISIT QUESTION
  // ==================================================

  const visitQuestion = (questionId) => {
    setCurrentQuestionId(questionId);

    setVisitedQuestions((previous) => {
      if (previous.includes(questionId)) {
        return previous;
      }

      return [...previous, questionId];
    });
  };

  // ==================================================
  // MOVE TO NEXT QUESTION
  // ==================================================

  const moveToNextQuestion = () => {
    if (!currentQuestion) return;

    // ----------------------------------------------
    // NEXT QUESTION IN SAME SECTION
    // ----------------------------------------------

    if (!isLastQuestion) {
      const nextQuestion =
        currentSectionQuestions[currentQuestionIndex + 1];

      visitQuestion(nextQuestion.id);

      return;
    }

    // ----------------------------------------------
    // LAST QUESTION OF SECTION
    // ----------------------------------------------

    if (!isLastSection) {
      // IMPORTANT:
      // We do NOT automatically move section
      // just because last question was reached.
      //
      // Section will change only when timer expires.

      return;
    }

    // ----------------------------------------------
    // LAST QUESTION OF LAST SECTION
    // ----------------------------------------------

    handleSubmit();
  };

  // ==================================================
  // MOVE TO PREVIOUS QUESTION
  // ==================================================

  const moveToPreviousQuestion = () => {
    if (!currentQuestion) return;

    if (!isFirstQuestion) {
      const previousQuestion =
        currentSectionQuestions[currentQuestionIndex - 1];

      visitQuestion(previousQuestion.id);

      return;
    }

    // ----------------------------------------------
    // FIRST QUESTION OF SECTION
    // ----------------------------------------------

    // Previous section is intentionally disabled.
    //
    // Because sectional timing means:
    //
    // Section 1 → Section 2 → Section 3
    //
    // User cannot go backwards.

    return;
  };

  // ==================================================
  // SECTION CHANGE
  // ==================================================

  const handleSectionChange = (sectionId) => {
    // Find requested section
    const requestedSectionIndex = sections.findIndex(
      (section) => section.id === sectionId
    );

    // Current section index
    const activeSectionIndex = sections.findIndex(
      (section) => section.id === currentSectionId
    );

    // ----------------------------------------------
    // BLOCK PREVIOUS SECTION
    // ----------------------------------------------

    if (requestedSectionIndex < activeSectionIndex) {
      return;
    }

    // ----------------------------------------------
    // BLOCK FUTURE SECTIONS
    // ----------------------------------------------

    if (requestedSectionIndex > activeSectionIndex) {
      return;
    }

    // Current section only
    const sectionQuestions = questions.filter(
      (question) => question.sectionId === sectionId
    );

    if (!sectionQuestions.length) return;

    setCurrentSectionId(sectionId);

    visitQuestion(sectionQuestions[0].id);
  };

  // ==================================================
  // QUESTION PALETTE CLICK
  // ==================================================

  const handleQuestionClick = (questionId) => {
    const question = questions.find(
      (item) => item.id === questionId
    );

    if (!question) return;

    // Only current section questions allowed
    if (question.sectionId !== currentSectionId) {
      return;
    }

    visitQuestion(questionId);
  };

  // ==================================================
  // SECTION TIMER FINISHED
  // ==================================================

  const handleSectionTimeUp = () => {
    // ----------------------------------------------
    // CURRENT SECTION COMPLETE
    // ----------------------------------------------

    setCompletedSections((previous) => {
      if (previous.includes(currentSectionId)) {
        return previous;
      }

      return [...previous, currentSectionId];
    });

    // ----------------------------------------------
    // LAST SECTION
    // ----------------------------------------------

    if (isLastSection) {
      handleSubmit();
      return;
    }

    // ----------------------------------------------
    // NEXT SECTION
    // ----------------------------------------------

    const nextSection =
      sections[currentSectionIndex + 1];

    if (!nextSection) {
      handleSubmit();
      return;
    }

    const nextSectionQuestions =
      questions.filter(
        (question) =>
          question.sectionId === nextSection.id
      );

    if (!nextSectionQuestions.length) {
      handleSubmit();
      return;
    }

    // Unlock next section
    setCurrentSectionId(nextSection.id);

    // Open first question of next section
    setCurrentQuestionId(
      nextSectionQuestions[0].id
    );

    // Mark visited
    setVisitedQuestions((previous) => {
      if (
        previous.includes(nextSectionQuestions[0].id)
      ) {
        return previous;
      }

      return [
        ...previous,
        nextSectionQuestions[0].id,
      ];
    });
  };

  // ==================================================
  // SUBMIT EXAM
  // ==================================================

  const handleSubmit = () => {
    const shouldSubmit = window.confirm(
      "Are you sure you want to submit the assessment?"
    );

    if (!shouldSubmit) {
      return;
    }

    console.log("Exam Submitted");
    console.log("Answers:", answers);
    console.log("Marked:", markedQuestions);

    setExamCompleted(true);
  };

  // ==================================================
  // RESTART EXAM
  // ==================================================

  const handleRestart = () => {
    window.location.reload();
  };

  // ==================================================
  // RESULT PAGE
  // ==================================================

  if (examCompleted) {
    return (
      <ResultPage
        examData={examData}
        answers={answers}
        onRestart={handleRestart}
      />
    );
  }

  // ==================================================
  // CURRENT SECTION COMPLETION STATUS
  // ==================================================

  const isSectionCompleted =
    completedSections.includes(currentSectionId);

  // ==================================================
  // SUMMARY COUNTS
  // ==================================================

  const answeredCount =
    currentSectionQuestions.filter((question) => {
      const answer = answers[question.id];

      return (
        answer !== undefined &&
        answer !== null &&
        answer !== ""
      );
    }).length;

  const markedCount =
    currentSectionQuestions.filter((question) =>
      markedQuestions.includes(question.id)
    ).length;

  const visitedCount =
    currentSectionQuestions.filter((question) =>
      visitedQuestions.includes(question.id)
    ).length;

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-100">

      {/* ============================================
          HEADER
      ============================================ */}

      <ExamHeader
  candidateName="Candidate"
  duration={currentSection?.duration * 60}
  sectionName={currentSection?.name}
  sectionNumber={currentSectionIndex + 1}
  totalSections={sections.length}
  onTimeUp={handleSectionTimeUp}
/>

      {/* ============================================
          MAIN EXAM AREA
      ============================================ */}

      <div className="flex w-full h-[calc(100vh-70px)]">

        {/* ==========================================
            LEFT SIDEBAR
        ========================================== */}

        <aside className="hidden lg:block w-[250px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SectionSidebar
            sections={sections}
            currentSectionId={currentSectionId}
            onSectionChange={handleSectionChange}
            completedSections={completedSections}
          />
        </aside>

        {/* ==========================================
            CENTER QUESTION AREA
        ========================================== */}

        <main className="flex-1 min-w-0 h-full">

          <QuestionPanel
            question={currentQuestion}
            questionNumber={questionNumber}
            totalQuestions={currentSectionQuestions.length}
            selectedAnswer={
              answers[currentQuestion?.id]
            }
            onAnswer={handleAnswer}
            marked={markedQuestions.includes(
              currentQuestion?.id
            )}
            toggleMark={toggleMark}
            onNext={moveToNextQuestion}
            onPrevious={moveToPreviousQuestion}
            isFirst={isFirstQuestion}
            isLast={
              isLastQuestion &&
              isLastSection
            }
            sectionName={currentSection?.name}
          />

          {/* ========================================
              MOBILE SECTION INFO
          ======================================== */}

          <div className="lg:hidden px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-500">
                  Current Section
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  {currentSection?.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Section
                </p>

                <p className="text-sm font-semibold text-blue-600">
                  {currentSectionIndex + 1} /{" "}
                  {sections.length}
                </p>
              </div>

            </div>
          </div>
        </main>

        {/* ==========================================
            RIGHT SIDEBAR
        ========================================== */}

        <aside className="hidden xl:block w-[300px] shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-4">

          {/* ========================================
              CANDIDATE INFO
          ======================================== */}

          {/* <div className="bg-white rounded-lg border border-gray-200">

            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">
                Candidate
              </h3>
            </div>

            <div className="p-4 flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                C
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Candidate
                </p>
                <p className="text-xs text-gray-500">
                  Online Assessment
                </p>
              </div>

            </div>
          </div> */}

          {/* ========================================
              CURRENT SECTION
          ======================================== */}

          {/* <div className="bg-white rounded-lg border border-gray-200">

            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-xs text-gray-500">
                Current Section
              </p>

              <p className="text-sm font-semibold text-blue-700 mt-1">
                {currentSection?.name}
              </p>
            </div>

            <div className="p-4">

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Section
                </span>

                <span className="font-semibold text-gray-700">
                  {currentSectionIndex + 1} /{" "}
                  {sections.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-gray-500">
                  Questions
                </span>

                <span className="font-semibold text-gray-700">
                  {currentSectionQuestions.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-gray-500">
                  Duration
                </span>

                <span className="font-semibold text-gray-700">
                  {currentSection?.duration} min
                </span>
              </div>

            </div>
          </div> */}

          {/* ========================================
              QUESTION PALETTE
          ======================================== */}

          <QuestionPalette
            questions={currentSectionQuestions}
            currentQuestionId={currentQuestionId}
            answers={answers}
            markedQuestions={markedQuestions}
            visitedQuestions={visitedQuestions}
            onQuestionClick={handleQuestionClick}
          />

          {/* ========================================
              SECTION SUMMARY
          ======================================== */}

          <SectionSummary
            totalQuestions={
              currentSectionQuestions.length
            }
            answeredCount={answeredCount}
            markedCount={markedCount}
            visitedCount={visitedCount}
          />

          {/* ========================================
              SECTION STATUS
          ======================================== */}

          <div
            className={`rounded-lg border p-4 ${
              isSectionCompleted
                ? "bg-green-50 border-green-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >

            <p
              className={`text-sm font-semibold ${
                isSectionCompleted
                  ? "text-green-700"
                  : "text-blue-700"
              }`}
            >
              {isSectionCompleted
                ? "Section Completed"
                : "Section In Progress"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {isSectionCompleted
                ? "This section is locked."
                : "Complete this section before moving to the next section."}
            </p>

          </div>
        </aside>
      </div>
    </div>
  );
}