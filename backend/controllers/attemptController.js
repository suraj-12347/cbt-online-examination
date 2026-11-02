import mongoose from "mongoose";

import Attempt from "../models/attemptModel.js";
import Exam from "../models/examModel.js";
import Section from "../models/sectionModel.js";
import Question from "../models/questionModel.js";
import Answer from "../models/answerModel.js";
import Result from "../models/resultModel.js";
import ScheduledExam from "../models/scheduledExamModel.js";

// =====================================================
// HELPER: Get Exam Sections
// =====================================================

const getExamSections = (exam) => {
  if (!Array.isArray(exam?.sections)) {
    return [];
  }

  return [...exam.sections].sort(
    (a, b) =>
      Number(a?.order || 0) -
      Number(b?.order || 0)
  );
};

// =====================================================
// HELPER: Get Questions Of Section
// =====================================================

const getSectionQuestions = async (
  sectionRef,
  examId,
  sectionId
) => {
  const ids = Array.isArray(sectionRef?.questionIds)
    ? sectionRef.questionIds
    : [];

  // ---------------------------------------------------
  // Exam.sections.questionIds is source of truth
  // ---------------------------------------------------

  if (ids.length > 0) {
    const questions = await Question.find({
      _id: { $in: ids },
      examId,
      sectionId,
    }).sort({
      order: 1,
    });

    const questionMap = new Map(
      questions.map((question) => [
        String(question._id),
        question,
      ])
    );

    return ids
      .map((id) =>
        questionMap.get(String(id))
      )
      .filter(Boolean);
  }

  // ---------------------------------------------------
  // Fallback
  // ---------------------------------------------------

  return Question.find({
    examId,
    sectionId,
  }).sort({
    order: 1,
  });
};

// =====================================================
// HELPER: Populate Attempt
// =====================================================

const populateAttempt = async (attemptId) => {
  return Attempt.findById(attemptId)
    .populate("userId", "-password")
    .populate("scheduledExamId")
    .populate("currentSection")
    .populate("currentQuestion")
    .populate({
      path: "examId",
      populate: [
        {
          path: "sections.sectionId",
          model: "Section",
        },
        {
          path: "sections.questionIds",
          model: "Question",
        },
      ],
    });
};

// =====================================================
// HELPER: Calculate Result
// =====================================================

const calculateResultData = async (attempt) => {
  // ---------------------------------------------------
  // Get all questions of this exam
  // ---------------------------------------------------

  const questions = await Question.find({
    examId: attempt.examId,
  }).sort({
    order: 1,
  });

  // ---------------------------------------------------
  // Get all answers of this attempt
  // ---------------------------------------------------

  const answers = await Answer.find({
    attemptId: attempt._id,
  });

  const answerMap = new Map();

  answers.forEach((answer) => {
    answerMap.set(
      String(answer.questionId),
      answer
    );
  });

  // ---------------------------------------------------
  // Counters
  // ---------------------------------------------------

  let attemptedQuestions = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedQuestions = 0;

  let obtainedMarks = 0;

  // ===================================================
  // Check Every Question
  // ===================================================

  for (const question of questions) {
    const answer = answerMap.get(
      String(question._id)
    );

    // -------------------------------------------------
    // IMPORTANT:
    // selectedAnswer = 0 is a valid answer
    // so DON'T use Boolean(selectedAnswer)
    // -------------------------------------------------

    const hasAnswer =
      answer &&
      answer.selectedAnswer !== null &&
      answer.selectedAnswer !== undefined &&
      answer.selectedAnswer !== "";

    // -------------------------------------------------
    // Skipped
    // -------------------------------------------------

    if (!hasAnswer) {
      skippedQuestions++;
      continue;
    }

    attemptedQuestions++;

    // -------------------------------------------------
    // Frontend sends option INDEX
    //
    // 0 = A
    // 1 = B
    // 2 = C
    // 3 = D
    //
    // correctAnswer stores option TEXT
    // -------------------------------------------------

    let selectedText = answer.selectedAnswer;

    const selectedValue =
      answer.selectedAnswer;

    const isNumericIndex =
      typeof selectedValue === "number" &&
      Number.isInteger(selectedValue);

    const isNumericString =
      typeof selectedValue === "string" &&
      /^\d+$/.test(
        selectedValue.trim()
      );

    if (
      isNumericIndex ||
      isNumericString
    ) {
      const optionIndex =
        Number(selectedValue);

      selectedText =
        question.options?.[
          optionIndex
        ]?.text ?? "";
    }

    // -------------------------------------------------
    // Compare selected option text with correct answer
    // -------------------------------------------------

    const isCorrect =
      String(selectedText)
        .trim()
        .toLowerCase() ===
      String(
        question.correctAnswer ?? ""
      )
        .trim()
        .toLowerCase();

    // -------------------------------------------------
    // Correct
    // -------------------------------------------------

    if (isCorrect) {
      correctAnswers++;

      obtainedMarks += Number(
        question.marks || 0
      );
    }

    // -------------------------------------------------
    // Wrong
    // -------------------------------------------------

    else {
      wrongAnswers++;

      obtainedMarks -= Number(
        question.negativeMarks || 0
      );
    }
  }

  // ===================================================
  // Total Marks
  // ===================================================

  const totalMarks = questions.reduce(
    (sum, question) =>
      sum + Number(question.marks || 0),
    0
  );

  // ---------------------------------------------------
  // Score cannot go below 0
  // ---------------------------------------------------

  const safeObtainedMarks = Math.max(
    0,
    obtainedMarks
  );

  // ===================================================
  // Percentage
  // ===================================================

  const percentage =
    totalMarks > 0
      ? (safeObtainedMarks / totalMarks) *
        100
      : 0;

  // ===================================================
  // Accuracy
  // ===================================================

  const accuracy =
    attemptedQuestions > 0
      ? (correctAnswers /
          attemptedQuestions) *
        100
      : 0;

  // ===================================================
  // Return Result Data
  // ===================================================

  return {
    totalQuestions: questions.length,

    attemptedQuestions,

    correctAnswers,

    wrongAnswers,

    skippedQuestions,

    totalMarks,

    obtainedMarks: safeObtainedMarks,

    percentage: Number(
      percentage.toFixed(2)
    ),

    accuracy: Number(
      accuracy.toFixed(2)
    ),
  };
};

// =====================================================
// HELPER: Create / Update Result
// =====================================================

// =====================================================
// SAVE RESULT
// =====================================================
// =====================================================
// SAVE RESULT
// =====================================================
const saveResult = async (attempt, resultData) => {
  // =====================================================
  // PASS / FAIL
  // 40% or above = PASSED
  // =====================================================

  const status =
    resultData.percentage >= 40
      ? "passed"
      : "failed";

  // =====================================================
  // Find Existing Result
  // =====================================================

  let result = await Result.findOne({
    attemptId: attempt._id,
  });

  // =====================================================
  // Update Existing Result
  // =====================================================

  if (result) {
    result.userId = attempt.userId;

    result.examId = attempt.examId;

    result.totalQuestions =
      resultData.totalQuestions || 0;

    result.attempted =
      resultData.attemptedQuestions || 0;

    result.correct =
      resultData.correctAnswers || 0;

    result.wrong =
      resultData.wrongAnswers || 0;

    result.skipped =
      resultData.skippedQuestions || 0;

    result.positiveMarks =
      resultData.positiveMarks || 0;

    result.negativeMarks =
      resultData.negativeMarks || 0;

    result.maxMarks =
      resultData.totalMarks || 0;

    result.obtainedMarks =
      resultData.obtainedMarks || 0;

    result.percentage =
      resultData.percentage || 0;

    // IMPORTANT
    result.status = status;

    result.calculatedAt = new Date();

    await result.save();

    return result;
  }

  // =====================================================
  // Create New Result
  // =====================================================

  result = await Result.create({
    attemptId: attempt._id,

    userId: attempt.userId,

    examId: attempt.examId,

    totalQuestions:
      resultData.totalQuestions || 0,

    attempted:
      resultData.attemptedQuestions || 0,

    correct:
      resultData.correctAnswers || 0,

    wrong:
      resultData.wrongAnswers || 0,

    skipped:
      resultData.skippedQuestions || 0,

    positiveMarks:
      resultData.positiveMarks || 0,

    negativeMarks:
      resultData.negativeMarks || 0,

    maxMarks:
      resultData.totalMarks || 0,

    obtainedMarks:
      resultData.obtainedMarks || 0,

    percentage:
      resultData.percentage || 0,

    // IMPORTANT
    status,

    calculatedAt: new Date(),
  });

  return result;
};

// =====================================================
// START / RESUME ATTEMPT
// =====================================================

export const startAttempt = async (
  req,
  res
) => {
  try {
    const {
      examId,
      scheduledExamId,
    } = req.body;

    // =================================================
    // Validate IDs
    // =================================================

    if (!examId || !scheduledExamId) {
      return res.status(400).json({
        success: false,
        message:
          "examId and scheduledExamId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        examId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        scheduledExamId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid scheduled exam ID",
      });
    }

    // =================================================
    // Get Scheduled Exam
    // =================================================

    const scheduledExam =
      await ScheduledExam.findById(
        scheduledExamId
      );

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    // =================================================
    // Check Student
    // =================================================

    if (
      String(scheduledExam.studentId) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This exam is not assigned to you",
      });
    }

    // =================================================
    // Check Scheduled Exam -> Exam
    // =================================================

    if (
      String(scheduledExam.examId) !==
      String(examId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Scheduled exam does not belong to this exam",
      });
    }

    const now = new Date();

    const startTime =
      scheduledExam.startTime
        ? new Date(
            scheduledExam.startTime
          )
        : null;

    const endTime =
      scheduledExam.endTime
        ? new Date(
            scheduledExam.endTime
          )
        : null;

    // =================================================
    // Cancelled
    // =================================================

    if (
      scheduledExam.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This scheduled exam has been cancelled",
      });
    }

    // =================================================
    // Completed
    // =================================================

    if (
      scheduledExam.status ===
      "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This scheduled exam has already completed",
      });
    }

    // =================================================
    // Before Start Time
    // =================================================

    if (
      startTime &&
      now < startTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam has not started yet",
        startTime,
      });
    }

    // =================================================
    // After End Time
    // =================================================

    if (
      endTime &&
      now >= endTime
    ) {
      scheduledExam.status =
        "completed";

      scheduledExam.accessGranted =
        false;

      await scheduledExam.save();

      return res.status(400).json({
        success: false,
        message:
          "Exam end time has already passed",
      });
    }

    // =================================================
    // IMPORTANT
    //
    // DO NOT CHECK:
    // exam.status
    //
    // ScheduledExam controls access.
    // =================================================

    // =================================================
    // Auto Activate Scheduled Exam
    // =================================================

    if (
      scheduledExam.status ===
        "scheduled" &&
      (!startTime ||
        now >= startTime) &&
      (!endTime ||
        now < endTime)
    ) {
      scheduledExam.status =
        "active";

      scheduledExam.accessGranted =
        true;

      await scheduledExam.save();
    }

    // =================================================
    // Only Active Scheduled Exam
    // =================================================

    if (
      scheduledExam.status !==
      "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Scheduled exam is not active",
      });
    }

    // =================================================
    // Resume Existing Attempt
    // =================================================

    const existingAttempt =
      await Attempt.findOne({
        userId: req.user.userId,

        scheduledExamId,

        status: "started",
      });

    if (existingAttempt) {
      const populatedAttempt =
        await populateAttempt(
          existingAttempt._id
        );

      const answers =
        await Answer.find({
          attemptId:
            existingAttempt._id,
        });

      const result =
        await Result.findOne({
          attemptId:
            existingAttempt._id,
        });

      return res.status(200).json({
        success: true,

        message:
          "Existing attempt found",

        attempt:
          populatedAttempt,

        answers,

        result,
      });
    }

    // =================================================
    // Get Exam
    //
    // IMPORTANT:
    // Exam.status is NOT checked.
    // =================================================

    const exam =
      await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // =================================================
    // Get Exam Sections
    // =================================================

    const examSections =
      getExamSections(exam);

    if (!examSections.length) {
      return res.status(404).json({
        success: false,
        message:
          "No sections configured for this exam",
      });
    }

    // =================================================
    // First Section
    // =================================================

    const firstRef =
      examSections[0];

    const firstSectionId =
      firstRef?.sectionId ||
      firstRef?._id;

    if (!firstSectionId) {
      return res.status(404).json({
        success: false,
        message:
          "First section is invalid",
      });
    }

    const firstSection =
      await Section.findById(
        firstSectionId
      );

    if (!firstSection) {
      return res.status(404).json({
        success: false,
        message:
          "First section not found",
      });
    }

    // =================================================
    // First Section Questions
    // =================================================

    const firstQuestions =
      await getSectionQuestions(
        firstRef,
        examId,
        firstSection._id
      );

    // =================================================
    // Timer
    // =================================================

    const startedAt =
      new Date();

    const durationMinutes =
      Number(
        firstRef?.duration ??
          firstSection.duration ??
          0
      );

    const sectionEndsAt =
      new Date(
        startedAt.getTime() +
          Math.max(
            0,
            durationMinutes
          ) *
            60 *
            1000
      );

    // =================================================
    // Total Questions
    // =================================================

    const totalQuestions =
      examSections.reduce(
        (total, ref) =>
          total +
          (Array.isArray(
            ref?.questionIds
          )
            ? ref.questionIds.length
            : 0),
        0
      );

    // =================================================
    // Create Attempt
    // =================================================

    const attempt =
      await Attempt.create({
        userId:
          req.user.userId,

        examId,

        scheduledExamId,

        currentSection:
          firstSection._id,

        currentQuestion:
          firstQuestions[0]?._id ||
          null,

        startedAt,

        sectionStartedAt:
          startedAt,

        sectionEndsAt,

        status: "started",

        totalQuestions,

        attemptedQuestions: 0,

        correctAnswers: 0,

        wrongAnswers: 0,

        skippedQuestions: 0,

        totalMarks:
          exam.totalMarks || 0,

        obtainedMarks: 0,

        percentage: 0,

        accuracy: 0,
      });

    // =================================================
    // Populate Attempt
    // =================================================

    const populatedAttempt =
      await populateAttempt(
        attempt._id
      );

    return res.status(201).json({
      success: true,

      message:
        "Exam started successfully",

      attempt:
        populatedAttempt,

      answers: [],
    });
  } catch (error) {
    console.error(
      "Start Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start exam",
      error: error.message,
    });
  }
};

// =====================================================
// GET ATTEMPT BY ID - STUDENT
// =====================================================

export const getAttemptById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    const attempt =
      await populateAttempt(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Attempt not found",
      });
    }

    // =================================================
    // Ownership
    // =================================================

    if (
      String(
        attempt.userId?._id ||
          attempt.userId
      ) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this attempt",
      });
    }

    // =================================================
    // Answers
    // =================================================

    const answers =
      await Answer.find({
        attemptId: id,
      }).populate(
        "questionId"
      );

    // =================================================
    // Result
    // =================================================

    const result =
      await Result.findOne({
        attemptId: id,
      });

    return res.status(200).json({
      success: true,

      message:
        "Attempt fetched successfully",

      attempt,

      answers,

      result,
    });
  } catch (error) {
    console.error(
      "Get Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get attempt",
      error: error.message,
    });
  }
};

// =====================================================
// MOVE TO NEXT SECTION
// =====================================================

export const nextSection = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // =================================================
    // Validate ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    // =================================================
    // Get Attempt
    // =================================================

    const attempt =
      await Attempt.findById(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Attempt not found",
      });
    }

    // =================================================
    // Ownership
    // =================================================

    if (
      String(attempt.userId) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // =================================================
    // Status
    // =================================================

    if (
      attempt.status !==
      "started"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt is not active",
      });
    }

    // =================================================
    // Section Timer
    // =================================================

    if (
      !attempt.sectionEndsAt ||
      new Date() <
        new Date(
          attempt.sectionEndsAt
        )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current section time has not expired yet",
      });
    }

    // =================================================
    // Get Exam
    // =================================================

    const exam =
      await Exam.findById(
        attempt.examId
      );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found",
      });
    }

    // =================================================
    // Sections
    // =================================================

    const examSections =
      getExamSections(exam);

    const currentIndex =
      examSections.findIndex(
        (section) =>
          String(
            section?.sectionId ||
              section?._id
          ) ===
          String(
            attempt.currentSection
          )
      );

    if (currentIndex < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Current section is not part of this exam",
      });
    }

    // =================================================
    // Last Section
    // =================================================

    if (
      currentIndex >=
      examSections.length - 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This is the last section. Submit the exam.",
      });
    }

    // =================================================
    // Next Section
    // =================================================

    const nextRef =
      examSections[
        currentIndex + 1
      ];

    const nextSectionId =
      nextRef?.sectionId ||
      nextRef?._id;

    const nextSectionDoc =
      await Section.findById(
        nextSectionId
      );

    if (!nextSectionDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Next section not found",
      });
    }

    // =================================================
    // Questions
    // =================================================

    const nextQuestions =
      await getSectionQuestions(
        nextRef,
        exam._id,
        nextSectionDoc._id
      );

    // =================================================
    // Timer
    // =================================================

    const sectionStartedAt =
      new Date();

    const durationMinutes =
      Number(
        nextRef?.duration ??
          nextSectionDoc.duration ??
          0
      );

    const sectionEndsAt =
      new Date(
        sectionStartedAt.getTime() +
          Math.max(
            0,
            durationMinutes
          ) *
            60 *
            1000
      );

    // =================================================
    // Update Attempt
    // =================================================

    attempt.currentSection =
      nextSectionDoc._id;

    attempt.currentQuestion =
      nextQuestions[0]?._id ||
      null;

    attempt.sectionStartedAt =
      sectionStartedAt;

    attempt.sectionEndsAt =
      sectionEndsAt;

    await attempt.save();

    // =================================================
    // Populate
    // =================================================

    const populatedAttempt =
      await populateAttempt(
        attempt._id
      );

    const answers =
      await Answer.find({
        attemptId:
          attempt._id,
      });

    return res.status(200).json({
      success: true,

      message:
        "Next section started successfully",

      attempt:
        populatedAttempt,

      answers,

      sectionIndex:
        currentIndex + 1,
    });
  } catch (error) {
    console.error(
      "Next Section Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start next section",
      error: error.message,
    });
  }
};

// =====================================================
// SUBMIT ATTEMPT
// =====================================================

export const submitAttempt = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // =================================================
    // Validate ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    // =================================================
    // Get Attempt
    // =================================================

    const attempt =
      await Attempt.findById(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Attempt not found",
      });
    }

    // =================================================
    // Ownership
    // =================================================

    if (
      String(attempt.userId) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // =================================================
    // Status
    // =================================================

    if (
      attempt.status !==
      "started"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt is already completed",
      });
    }

    // =================================================
    // Calculate Result
    // =================================================

    const resultData =
      await calculateResultData(
        attempt
      );

    // =================================================
    // Update Attempt
    // =================================================

    attempt.status =
      "completed";

    attempt.submittedAt =
      new Date();

    attempt.totalQuestions =
      resultData.totalQuestions;

    attempt.attemptedQuestions =
      resultData.attemptedQuestions;

    attempt.correctAnswers =
      resultData.correctAnswers;

    attempt.wrongAnswers =
      resultData.wrongAnswers;

    attempt.skippedQuestions =
      resultData.skippedQuestions;

    attempt.totalMarks =
      resultData.totalMarks;

    attempt.obtainedMarks =
      resultData.obtainedMarks;

    attempt.percentage =
      resultData.percentage;

    attempt.accuracy =
      resultData.accuracy;

    await attempt.save();

    // =================================================
    // Create / Update Result
    // =================================================

    const result =
      await saveResult(
        attempt,
        resultData
      );

    // =================================================
    // Close Scheduled Exam Access
    // =================================================

    if (
      attempt.scheduledExamId
    ) {
      await ScheduledExam.findByIdAndUpdate(
        attempt.scheduledExamId,
        {
          $set: {
            accessGranted:
              false,
          },
        }
      );
    }

    // =================================================
    // Populate Attempt
    // =================================================

    const populatedAttempt =
      await populateAttempt(
        attempt._id
      );

    return res.status(200).json({
      success: true,

      message:
        "Exam submitted successfully",

      attempt:
        populatedAttempt,

      result,

      resultId:
        result._id,
    });
  } catch (error) {
    console.error(
      "Submit Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit exam",
      error: error.message,
    });
  }
};

// =====================================================
// EXPIRE ATTEMPT
// =====================================================

export const expireAttempt = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // =================================================
    // Validate ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    // =================================================
    // Get Attempt
    // =================================================

    const attempt =
      await Attempt.findById(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Attempt not found",
      });
    }

    // =================================================
    // Ownership
    // =================================================

    if (
      String(attempt.userId) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // =================================================
    // Status
    // =================================================

    if (
      attempt.status !==
      "started"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt is already closed",
      });
    }

    // =================================================
    // Calculate Result
    // =================================================

    const resultData =
      await calculateResultData(
        attempt
      );

    // =================================================
    // Update Attempt
    // =================================================

    attempt.status =
      "expired";

    attempt.submittedAt =
      new Date();

    attempt.totalQuestions =
      resultData.totalQuestions;

    attempt.attemptedQuestions =
      resultData.attemptedQuestions;

    attempt.correctAnswers =
      resultData.correctAnswers;

    attempt.wrongAnswers =
      resultData.wrongAnswers;

    attempt.skippedQuestions =
      resultData.skippedQuestions;

    attempt.totalMarks =
      resultData.totalMarks;

    attempt.obtainedMarks =
      resultData.obtainedMarks;

    attempt.percentage =
      resultData.percentage;

    attempt.accuracy =
      resultData.accuracy;

    await attempt.save();

    // =================================================
    // Create / Update Result
    // =================================================

    const result =
      await saveResult(
        attempt,
        resultData
      );

    // =================================================
    // Close Scheduled Exam Access
    // =================================================

    if (
      attempt.scheduledExamId
    ) {
      await ScheduledExam.findByIdAndUpdate(
        attempt.scheduledExamId,
        {
          $set: {
            accessGranted:
              false,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Attempt expired successfully",

      attempt,

      result,

      resultId:
        result._id,
    });
  } catch (error) {
    console.error(
      "Expire Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to expire exam",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN: GET ALL ATTEMPTS
// =====================================================

export const getAllAttempts = async (
  req,
  res
) => {
  try {
    const attempts =
      await Attempt.find()
        .populate(
          "userId",
          "-password"
        )
        .populate("examId")
        .populate(
          "scheduledExamId"
        )
        .populate(
          "currentSection"
        )
        .populate(
          "currentQuestion"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      message:
        "Attempts fetched successfully",

      attempts,
    });
  } catch (error) {
    console.error(
      "Get All Attempts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch attempts",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN: GET SINGLE ATTEMPT
// =====================================================

export const getAttemptByIdAdmin =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      // =================================================
      // Validate ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid attempt ID",
        });
      }

      // =================================================
      // Get Attempt
      // =================================================

      const attempt =
        await Attempt.findById(id)
          .populate(
            "userId",
            "-password"
          )
          .populate("examId")
          .populate(
            "scheduledExamId"
          )
          .populate(
            "currentSection"
          )
          .populate(
            "currentQuestion"
          );

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message:
            "Attempt not found",
        });
      }

      // =================================================
      // Answers
      // =================================================

      const answers =
        await Answer.find({
          attemptId: id,
        }).populate(
          "questionId"
        );

      // =================================================
      // Result
      // =================================================

      const result =
        await Result.findOne({
          attemptId: id,
        });

      return res.status(200).json({
        success: true,

        message:
          "Attempt fetched successfully",

        attempt,

        answers,

        result,
      });
    } catch (error) {
      console.error(
        "Get Admin Attempt Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch attempt",
        error: error.message,
      });
    }
  };