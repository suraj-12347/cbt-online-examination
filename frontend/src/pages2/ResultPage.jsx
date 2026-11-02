// src/pages/ResultPage.jsx

export default function ResultPage({
  examData,
  answers = {},
  onRestart,
}) {
  // --------------------------------------------------
  // ALL QUESTIONS
  // --------------------------------------------------
  const questions = examData?.questions || [];
  const sections = examData?.sections || [];

  // --------------------------------------------------
  // RESULT CALCULATION
  // --------------------------------------------------

  let totalMarks = 0;
  let obtainedMarks = 0;

  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let notAttempted = 0;

  questions.forEach((question) => {
    const maxMarks = Number(question.marks || 0);
    const negativeMarks = Number(question.negativeMarks || 0);

    totalMarks += maxMarks;

    const userAnswer = answers[question.id];

    // Coding questions are not auto-evaluated
    if (question.type === "coding") {
      if (
        userAnswer !== undefined &&
        userAnswer !== null &&
        String(userAnswer).trim() !== ""
      ) {
        attempted++;
      } else {
        notAttempted++;
      }

      return;
    }

    // Not attempted
    if (
      userAnswer === undefined ||
      userAnswer === null ||
      userAnswer === ""
    ) {
      notAttempted++;
      return;
    }

    attempted++;

    // Correct
    if (userAnswer === question.correctAnswer) {
      correct++;
      obtainedMarks += maxMarks;
    }

    // Incorrect
    else {
      incorrect++;
      obtainedMarks -= negativeMarks;
    }
  });

  // Don't allow negative final score
  obtainedMarks = Math.max(obtainedMarks, 0);

  const percentage =
    totalMarks > 0
      ? ((obtainedMarks / totalMarks) * 100).toFixed(2)
      : "0.00";

  // --------------------------------------------------
  // PASS / FAIL
  // --------------------------------------------------

  const passingPercentage = 40;

  const isPassed = Number(percentage) >= passingPercentage;

  // --------------------------------------------------
  // SECTION WISE RESULT
  // --------------------------------------------------

  const sectionResults = sections.map((section) => {
    const sectionQuestions = questions.filter(
      (question) => question.sectionId === section.id
    );

    let sectionTotalMarks = 0;
    let sectionObtainedMarks = 0;

    let sectionAttempted = 0;
    let sectionCorrect = 0;
    let sectionIncorrect = 0;
    let sectionNotAttempted = 0;

    sectionQuestions.forEach((question) => {
      const marks = Number(question.marks || 0);
      const negativeMarks = Number(question.negativeMarks || 0);

      sectionTotalMarks += marks;

      const userAnswer = answers[question.id];

      // Coding question
      if (question.type === "coding") {
        if (
          userAnswer !== undefined &&
          userAnswer !== null &&
          String(userAnswer).trim() !== ""
        ) {
          sectionAttempted++;
        } else {
          sectionNotAttempted++;
        }

        return;
      }

      // Not attempted
      if (
        userAnswer === undefined ||
        userAnswer === null ||
        userAnswer === ""
      ) {
        sectionNotAttempted++;
        return;
      }

      sectionAttempted++;

      // Correct
      if (userAnswer === question.correctAnswer) {
        sectionCorrect++;
        sectionObtainedMarks += marks;
      }

      // Incorrect
      else {
        sectionIncorrect++;
        sectionObtainedMarks -= negativeMarks;
      }
    });

    sectionObtainedMarks = Math.max(sectionObtainedMarks, 0);

    const sectionPercentage =
      sectionTotalMarks > 0
        ? ((sectionObtainedMarks / sectionTotalMarks) * 100).toFixed(1)
        : "0.0";

    return {
      id: section.id,
      name: section.name,
      totalQuestions: sectionQuestions.length,
      totalMarks: sectionTotalMarks,
      obtainedMarks: sectionObtainedMarks,
      attempted: sectionAttempted,
      correct: sectionCorrect,
      incorrect: sectionIncorrect,
      notAttempted: sectionNotAttempted,
      percentage: sectionPercentage,
    };
  });

  // --------------------------------------------------
  // DATE / TIME
  // --------------------------------------------------

  const submittedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ==============================================
          HEADER
      ============================================== */}
      <header className="h-[70px] bg-[#064273] text-white shadow-md">
        <div className="h-full flex items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold tracking-tight">IPS</div>

              <div className="hidden sm:block text-sm font-medium">
                UNIVERSITY 
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-white/30" />

            <div className="hidden md:block text-sm text-white/90">
              Campus Recruitment - Online Assessment
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/70">Assessment Completed</p>
            <p className="text-sm font-semibold">{submittedAt}</p>
          </div>
        </div>
      </header>

      {/* ==============================================
          MAIN CONTENT
      ============================================== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* ============================================
            RESULT HEADER
        ============================================ */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Assessment Result
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Campus Recruitment - Online Assessment
            </p>
          </div>

          {/* ==========================================
              SCORE AREA
          ========================================== */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* SCORE */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
                <p className="text-sm text-gray-500">Total Score</p>

                <div className="mt-2">
                  <span className="text-4xl font-bold text-blue-700">
                    {obtainedMarks}
                  </span>

                  <span className="text-lg text-gray-500">
                    {" "}
                    / {totalMarks}
                  </span>
                </div>
              </div>

              {/* PERCENTAGE */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                <p className="text-sm text-gray-500">Percentage</p>

                <p className="text-4xl font-bold text-gray-800 mt-2">
                  {percentage}%
                </p>
              </div>

              {/* RESULT STATUS */}
              <div
                className={`rounded-lg border p-5 text-center ${
                  isPassed
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="text-sm text-gray-500">Result Status</p>

                <p
                  className={`text-3xl font-bold mt-2 ${
                    isPassed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPassed ? "PASSED" : "FAILED"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Passing Criteria: {passingPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            PERFORMANCE SUMMARY
        ============================================ */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">
              Performance Summary
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* TOTAL */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">Total Questions</p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {questions.length}
                </p>
              </div>

              {/* ATTEMPTED */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">Attempted</p>

                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {attempted}
                </p>
              </div>

              {/* CORRECT */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">Correct</p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {correct}
                </p>
              </div>

              {/* INCORRECT */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">Incorrect</p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  {incorrect}
                </p>
              </div>
            </div>

            {/* NOT ATTEMPTED */}
            <div className="mt-4 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Not Attempted
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Questions that were left unanswered
                </p>
              </div>

              <span className="text-2xl font-bold text-gray-500">
                {notAttempted}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================
            SECTION WISE PERFORMANCE
        ============================================ */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">
              Section-wise Performance
            </h2>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Section
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Questions
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Attempted
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Correct
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Incorrect
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Score
                  </th>

                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Percentage
                  </th>
                </tr>
              </thead>

              <tbody>
                {sectionResults.map((section) => (
                  <tr
                    key={section.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {section.name}
                    </td>

                    <td className="px-4 py-4 text-center text-gray-600">
                      {section.totalQuestions}
                    </td>

                    <td className="px-4 py-4 text-center text-blue-600 font-medium">
                      {section.attempted}
                    </td>

                    <td className="px-4 py-4 text-center text-green-600 font-medium">
                      {section.correct}
                    </td>

                    <td className="px-4 py-4 text-center text-red-600 font-medium">
                      {section.incorrect}
                    </td>

                    <td className="px-4 py-4 text-center font-semibold text-gray-800">
                      {section.obtainedMarks} / {section.totalMarks}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-semibold ${
                          Number(section.percentage) >= 40
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {section.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================
            SCORE LEGEND
        ============================================ */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">
              Scoring Information
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">
                  Correct Answer = Positive Marks
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">
                  Wrong Answer = Negative Marks
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">
                  Not Attempted = 0 Marks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            ACTION BUTTONS
        ============================================ */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Restart Assessment
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Print Result
          </button>
        </div>
      </main>
    </div>
  );
}