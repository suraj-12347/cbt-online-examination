
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import ExamHeader from "../components/exam/ExamHeader";
import ExamTimer from "../components/exam/ExamTimer";
import SectionTabs from "../components/exam/SectionTabs";
import SectionSidebar from "../components/exam/SectionSidebar";
import QuestionPanel from "../components/exam/QuestionPanel";
import QuestionPalette from "../components/exam/QuestionPalette";
import ExamNavigation from "../components/exam/ExamNavigation";
import SubmitExamModal from "../components/exam/SubmitExamModal";

import { getScheduledExamById } from "../api/scheduledExamApi";

import {
  getAttemptById,
  saveAnswer,
  markForReview,
  startAttempt,
  nextSection,
  submitAttempt,
} from "../api/attemptApi";

import { getStudentId } from "../utils/storage";

// =====================================================
// START: Image URL Helper
// =====================================================

const getImageUrl = (value) => {
  if (!value) return "";

  // Already complete URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // If backend already returns /api/uploads/users/filename
  if (value.startsWith("/api/")) {
    return `${baseUrl}${value}`;
  }

  // If only filename is returned
  const fileName = value.split("/").pop();

  return `${baseUrl}/api/uploads/users/${fileName}`;
};

// =====================================================
// END: Image URL Helper
// =====================================================

const normalizeSections = (exam) => {
  const rawSections = exam?.sections || [];

  return [...rawSections]
    .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
    .map((item) => {
      const section = item?.sectionId || item;

      const questionIds = Array.isArray(item?.questionIds)
        ? item.questionIds
        : [];

      const questions =
        Array.isArray(item?.questions) && item.questions.length
          ? item.questions
          : questionIds;

      return {
        ...(section || {}),
        _id: section?._id || item?._id,
        duration: Number(item?.duration ?? section?.duration ?? 0),
        order: Number(item?.order ?? section?.order ?? 0),
        questions,
        questionIds,
      };
    });
};

const ExamPage = () => {
  const navigate = useNavigate();
  const { scheduledExamId } = useParams();

  const [scheduledExam, setScheduledExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingSection, setChangingSection] = useState(false);
  const [error, setError] = useState("");

  const transitionRef = useRef(false);
  const submitRef = useRef(false);

  const hydrateAttempt = useCallback(
    (loadedAttempt, fallbackExam = null) => {
      if (!loadedAttempt) return;

      setAttempt(loadedAttempt);

      const exam = loadedAttempt?.examId || fallbackExam;

      const loadedSections = normalizeSections(exam);

      setSections(loadedSections);

      const loadedAnswers = {};
      const loadedMarked = [];

      const answerList = Array.isArray(loadedAttempt?.answers)
        ? loadedAttempt.answers
        : [];

      answerList.forEach((answer) => {
        const questionId =
          answer?.questionId?._id || answer?.questionId;

        if (!questionId) return;

        if (
          answer?.selectedAnswer !== null &&
          answer?.selectedAnswer !== undefined &&
          answer?.selectedAnswer !== ""
        ) {
          loadedAnswers[questionId] = answer.selectedAnswer;
        }

        if (answer?.isMarkedForReview) {
          loadedMarked.push(String(questionId));
        }
      });

      setAnswers(loadedAnswers);
      setMarkedForReview(loadedMarked);

      const currentSectionId =
        loadedAttempt?.currentSection?._id ||
        loadedAttempt?.currentSection;

      const currentQuestionId =
        loadedAttempt?.currentQuestion?._id ||
        loadedAttempt?.currentQuestion;

      const foundSectionIndex = loadedSections.findIndex(
        (section) =>
          String(section?._id) === String(currentSectionId)
      );

      const safeSectionIndex =
        foundSectionIndex >= 0 ? foundSectionIndex : 0;

      setSectionIndex(safeSectionIndex);

      const currentQuestions =
        loadedSections[safeSectionIndex]?.questions || [];

      const foundQuestionIndex = currentQuestions.findIndex(
        (question) =>
          String(question?._id) === String(currentQuestionId)
      );

      const safeQuestionIndex =
        foundQuestionIndex >= 0 ? foundQuestionIndex : 0;

      setQuestionIndex(safeQuestionIndex);
      setVisitedQuestions([safeQuestionIndex]);
    },
    []
  );

  const loadAttempt = useCallback(
    async (attemptId, fallbackExam = null) => {
      const response = await getAttemptById(attemptId);

      const payload = response?.data || {};

      const loadedAttempt =
        payload?.attempt || payload?.data || payload;

      hydrateAttempt(loadedAttempt, fallbackExam);

      return loadedAttempt;
    },
    [hydrateAttempt]
  );

  useEffect(() => {
    let mounted = true;

    const initializeExam = async () => {
      try {
        setLoading(true);
        setError("");

        const scheduledResponse =
          await getScheduledExamById(scheduledExamId);

        const payload = scheduledResponse?.data || {};

        const schedule =
          payload?.scheduledExam ||
          payload?.data ||
          payload;

        if (!mounted) return;

        setScheduledExam(schedule);

        const studentId = getStudentId();

        if (!studentId) {
          throw new Error(
            "Student ID not found. Please login again."
          );
        }

        const examId =
          schedule?.examId?._id ||
          schedule?.examId;

        if (!examId) {
          throw new Error(
            "Exam ID not found in scheduled exam."
          );
        }

        const startResponse = await startAttempt({
          examId,
          scheduledExamId,
        });

        const startPayload = startResponse?.data || {};

        const newAttempt =
          startPayload?.attempt ||
          startPayload?.data ||
          startPayload;

        if (!newAttempt?._id) {
          throw new Error(
            "Attempt could not be created."
          );
        }

        localStorage.setItem(
          "attemptId",
          newAttempt._id
        );

        await loadAttempt(
          newAttempt._id,
          schedule?.examId
        );
      } catch (err) {
        const attemptId =
          localStorage.getItem("attemptId");

        if (attemptId) {
          try {
            await loadAttempt(attemptId);

            if (mounted) setError("");

            return;
          } catch {
            // Continue with original error
          }
        }

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to start exam."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeExam();

    return () => {
      mounted = false;
    };
  }, [scheduledExamId, loadAttempt]);

  const currentSection = sections[sectionIndex];
  const questions = currentSection?.questions || [];
  const currentQuestion = questions[questionIndex];

  const answerKey =
    currentQuestion?._id ||
    `${sectionIndex}-${questionIndex}`;

  const handleAnswerChange = async (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [answerKey]: answer,
    }));

    if (!attempt?._id || !currentQuestion?._id) return;

    try {
      setSaving(true);
      setError("");

      await saveAnswer(attempt._id, {
        questionId: currentQuestion._id,
        selectedAnswer: answer,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Answer could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (questionIndex >= questions.length - 1) return;

    const nextIndex = questionIndex + 1;

    setQuestionIndex(nextIndex);

    setVisitedQuestions((prev) =>
      prev.includes(nextIndex)
        ? prev
        : [...prev, nextIndex]
    );
  };

  const handlePrevious = () => {
    if (questionIndex <= 0) return;

    setQuestionIndex((prev) => prev - 1);
  };

  const handleQuestionChange = (index) => {
    if (
      index < 0 ||
      index >= questions.length
    )
      return;

    setQuestionIndex(index);

    setVisitedQuestions((prev) =>
      prev.includes(index)
        ? prev
        : [...prev, index]
    );
  };

  const handleClearResponse = async () => {
    if (
      !currentQuestion?._id ||
      !attempt?._id
    )
      return;

    try {
      setSaving(true);
      setError("");

      await saveAnswer(attempt._id, {
        questionId: currentQuestion._id,
        selectedAnswer: null,
      });

      setAnswers((prev) => {
        const copy = { ...prev };

        delete copy[answerKey];

        return copy;
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to clear response."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReview = async () => {
    if (
      !currentQuestion?._id ||
      !attempt?._id
    )
      return;

    try {
      setSaving(true);
      setError("");

      const response = await markForReview(
        attempt._id,
        {
          questionId: currentQuestion._id,
        }
      );

      const answer = response?.data?.answer;

      const isMarked = Boolean(
        answer?.isMarkedForReview
      );

      setMarkedForReview((prev) => {
        const id = String(
          currentQuestion._id
        );

        if (isMarked) {
          return prev.includes(id)
            ? prev
            : [...prev, id];
        }

        return prev.filter(
          (item) => String(item) !== id
        );
      });

      if (
        questionIndex <
        questions.length - 1
      ) {
        const nextIndex =
          questionIndex + 1;

        setQuestionIndex(nextIndex);

        setVisitedQuestions((prev) =>
          prev.includes(nextIndex)
            ? prev
            : [...prev, nextIndex]
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update review status."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (
      !attempt?._id ||
      submitRef.current
    )
      return;

    submitRef.current = true;

    try {
      setSaving(true);
      setError("");

      await submitAttempt(attempt._id);

      localStorage.removeItem("attemptId");

      navigate(
        `/exams/${scheduledExamId}/complete`,
        {
          replace: true,
        }
      );
    } catch (err) {
      submitRef.current = false;

      setError(
        err?.response?.data?.message ||
          "Unable to submit exam."
      );
    } finally {
      setSaving(false);
      setShowSubmitModal(false);
    }
  }, [
    attempt?._id,
    navigate,
    scheduledExamId,
  ]);

  const handleSectionTimeUp = useCallback(
    async () => {
      if (
        !attempt?._id ||
        transitionRef.current ||
        submitRef.current
      )
        return;

      transitionRef.current = true;

      try {
        setChangingSection(true);
        setError("");

        if (
          sectionIndex >=
          sections.length - 1
        ) {
          await handleSubmit();
          return;
        }

        const response = await nextSection(
          attempt._id
        );

        const payload =
          response?.data || {};

        const updatedAttempt =
          payload?.attempt ||
          payload?.data ||
          payload;

        if (!updatedAttempt?._id) {
          throw new Error(
            "Next section could not be started."
          );
        }

        setAttempt(updatedAttempt);

        const updatedSections =
          normalizeSections(
            updatedAttempt?.examId ||
              scheduledExam?.examId
          );

        if (updatedSections.length) {
          setSections(updatedSections);
        }

        const nextIndex =
          sectionIndex + 1;

        setSectionIndex(nextIndex);
        setQuestionIndex(0);
        setVisitedQuestions([0]);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to move to the next section."
        );
      } finally {
        transitionRef.current = false;
        setChangingSection(false);
      }
    },
    [
      attempt?._id,
      handleSubmit,
      scheduledExam?.examId,
      sectionIndex,
      sections.length,
    ]
  );

  useEffect(() => {
    if (
      !scheduledExam?.endTime ||
      !attempt?._id
    )
      return undefined;

    const timer = setInterval(() => {
      if (
        Date.now() >=
        new Date(
          scheduledExam.endTime
        ).getTime()
      ) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    scheduledExam?.endTime,
    attempt?._id,
    handleSubmit,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#064273] rounded-full animate-spin mx-auto" />

          <p className="mt-4 font-semibold text-gray-800">
            Starting exam...
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Please do not close or refresh the page.
          </p>
        </div>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-7 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl">
            !
          </div>

          <h2 className="font-semibold text-gray-900 mt-4">
            Unable to start exam
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const exam =
    scheduledExam?.examId ||
    attempt?.examId ||
    {};

  const totalQuestions =
    questions.length;

  const sectionAnswers =
    Object.fromEntries(
      questions.map(
        (question, index) => [
          index,
          answers[
            question?._id ||
              `${sectionIndex}-${index}`
          ],
        ]
      )
    );

  const answered =
    questions.filter((question) => {
      const value =
        answers[question?._id];

      return (
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    }).length;

  const sectionMarked = questions
    .map((question, index) =>
      markedForReview.some(
        (id) =>
          String(id) ===
          String(question?._id)
      )
        ? index
        : null
    )
    .filter(
      (index) => index !== null
    );

  const candidate =
    scheduledExam?.studentId ||
    scheduledExam?.userId ||
    {};

  const candidateName =
    candidate?.name ||
    candidate?.fullName ||
    candidate?.studentName ||
    "Candidate";

  // =====================================================
  // START: Candidate Image URL
  // =====================================================

  const candidatePhoto = getImageUrl(
    candidate?.image ||
      candidate?.photo ||
      candidate?.profileImage ||
      ""
  );

  // =====================================================
  // END: Candidate Image URL
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {error && (
        <div className="bg-red-50 border-b border-red-100 text-red-700 px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      <ExamHeader
        examTitle={
          exam?.title ||
          "Campus Recruitment - Online Assessment"
        }
        candidateName={candidateName}
        candidatePhoto={candidatePhoto}
      />

      <div className="bg-gray-100 border-b px-3 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">
              Current Section
            </p>

            <p className="font-semibold text-gray-800">
              {currentSection?.name ||
                `Section ${
                  sectionIndex + 1
                }`}
            </p>
          </div>

          <ExamTimer
            endTime={attempt?.sectionEndsAt}
            onTimeUp={handleSectionTimeUp}
            disabled={changingSection}
          />
        </div>
      </div>

      <SectionTabs
        sections={sections}
        currentSectionIndex={sectionIndex}
      />

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-205px)]">
        <SectionSidebar
          sections={sections}
          currentSectionIndex={sectionIndex}
        />

        <QuestionPanel
          question={currentQuestion}
          questionNumber={
            questionIndex + 1
          }
          totalQuestions={totalQuestions}
          selectedAnswer={
            answers[answerKey]
          }
          onAnswerChange={
            handleAnswerChange
          }
        />

        <aside className="w-full lg:w-72 shrink-0 bg-gray-50 p-3 border-l">
          <QuestionPalette
            questions={questions}
            currentQuestionIndex={
              questionIndex
            }
            answers={sectionAnswers}
            markedForReview={
              sectionMarked
            }
            visitedQuestions={
              visitedQuestions
            }
            onQuestionChange={
              handleQuestionChange
            }
          />

          <div className="mt-3 bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">
                Section Progress
              </span>

              <span className="font-semibold text-gray-800">
                {answered}/
                {totalQuestions}
              </span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#064273] rounded-full transition-all"
                style={{
                  width: `${
                    totalQuestions
                      ? Math.min(
                          100,
                          (answered /
                            totalQuestions) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      <ExamNavigation
        currentQuestionIndex={
          questionIndex
        }
        totalQuestions={
          totalQuestions
        }
        onPrevious={
          handlePrevious
        }
        onNext={handleNext}
        onMarkReview={
          handleMarkReview
        }
        onClearResponse={
          handleClearResponse
        }
        onSubmit={() =>
          setShowSubmitModal(true)
        }
      />

      {(saving || changingSection) && (
        <div className="fixed bottom-20 left-3 z-30 bg-white border shadow-lg rounded-lg px-3 py-2 text-xs font-medium text-gray-700">
          {changingSection
            ? "Starting next section..."
            : "Saving..."}
        </div>
      )}

      <SubmitExamModal
        open={showSubmitModal}
        onClose={() =>
          setShowSubmitModal(false)
        }
        onConfirm={handleSubmit}
        answered={answered}
        unanswered={Math.max(
          0,
          totalQuestions - answered
        )}
        marked={sectionMarked.length}
        submitting={saving}
      />
    </div>
  );
};

export default ExamPage;

