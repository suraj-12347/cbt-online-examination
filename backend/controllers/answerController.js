
import mongoose from "mongoose";

import Answer from "../models/answerModel.js";
import Attempt from "../models/attemptModel.js";
import Question from "../models/questionModel.js";

// =====================================================
// SAVE / UPDATE / CLEAR ANSWER
// Route: POST /api/attempts/:id/answer
// =====================================================
export const saveAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    // IMPORTANT:
    // attemptRoutes.js uses /:id/answer
    const attemptId = req.params.id;

    // =================================================
    // Validation
    // =================================================

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    // =================================================
    // Find Attempt
    // =================================================

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // =================================================
    // Owner Check
    // =================================================

    if (String(attempt.userId) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // =================================================
    // Attempt Status
    // =================================================

    if (attempt.status !== "started") {
      return res.status(400).json({
        success: false,
        message: "Attempt is not active",
      });
    }

    // =================================================
    // Section Timer
    // =================================================

    if (
      attempt.sectionEndsAt &&
      new Date() >= new Date(attempt.sectionEndsAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Section time has expired",
      });
    }

    // =================================================
    // Get Question
    // =================================================

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // =================================================
    // Question must belong to exam
    // =================================================

    if (String(question.examId) !== String(attempt.examId)) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this exam",
      });
    }

    // =================================================
    // Question must belong to current section
    // =================================================

    if (
      attempt.currentSection &&
      String(question.sectionId) !==
        String(attempt.currentSection)
    ) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to current section",
      });
    }

    // =================================================
    // Check whether answer exists
    // =================================================

    const hasAnswer =
      selectedAnswer !== null &&
      selectedAnswer !== undefined &&
      selectedAnswer !== "";

    let answer = await Answer.findOne({
      attemptId: attempt._id,
      questionId,
    });

    // =================================================
    // CREATE ANSWER
    // =================================================

    if (!answer) {
      answer = new Answer({
        attemptId: attempt._id,
        questionId,

        selectedAnswer: hasAnswer ? selectedAnswer : null,

        isAttempted: hasAnswer,

        isMarkedForReview: false,

        answeredAt: hasAnswer ? new Date() : null,
      });
    }

    // =================================================
    // UPDATE ANSWER
    // =================================================

    else {
      answer.selectedAnswer = hasAnswer
        ? selectedAnswer
        : null;

      answer.isAttempted = hasAnswer;

      answer.answeredAt = hasAnswer
        ? new Date()
        : null;
    }

    await answer.save();

    // =================================================
    // Update Current Question
    // =================================================

    attempt.currentQuestion = questionId;

    await attempt.save();

    // =================================================
    // Response
    // =================================================

    return res.status(200).json({
      success: true,

      message: hasAnswer
        ? "Answer saved successfully"
        : "Response cleared successfully",

      answer,
    });
  } catch (error) {
    console.error("Save Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save answer",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ANSWERS OF ATTEMPT
// Route: GET /api/attempts/:attemptId/answers
// =====================================================
export const getAttemptAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // =================================================
    // Validation
    // =================================================

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    // =================================================
    // Find Attempt
    // =================================================

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // =================================================
    // Owner Check
    // =================================================

    if (String(attempt.userId) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // =================================================
    // Get Answers
    // =================================================

    const answers = await Answer.find({
      attemptId: attempt._id,
    })
      .populate(
        "questionId",
        "question type options marks negativeMarks correctAnswer"
      )
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: answers.length,
      answers,
    });
  } catch (error) {
    console.error("Get Attempt Answers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get answers",
      error: error.message,
    });
  }
};

// =====================================================
// MARK / UNMARK FOR REVIEW
// Route: POST /api/attempts/:id/mark-review
// =====================================================
export const toggleMarkForReview = async (req, res) => {
  try {
    const { questionId } = req.body;

    // IMPORTANT:
    // Route uses /:id/mark-review
    const attemptId = req.params.id;

    // =================================================
    // Validation
    // =================================================

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    // =================================================
    // Find Attempt
    // =================================================

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // =================================================
    // Owner Check
    // =================================================

    if (String(attempt.userId) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // =================================================
    // Attempt Status
    // =================================================

    if (attempt.status !== "started") {
      return res.status(400).json({
        success: false,
        message: "Attempt is not active",
      });
    }

    // =================================================
    // Timer
    // =================================================

    if (
      attempt.sectionEndsAt &&
      new Date() >= new Date(attempt.sectionEndsAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Section time has expired",
      });
    }

    // =================================================
    // Find Question
    // =================================================

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // =================================================
    // Exam Check
    // =================================================

    if (String(question.examId) !== String(attempt.examId)) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this exam",
      });
    }

    // =================================================
    // Section Check
    // =================================================

    if (
      attempt.currentSection &&
      String(question.sectionId) !==
        String(attempt.currentSection)
    ) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to current section",
      });
    }

    // =================================================
    // Find Answer
    // =================================================

    let answer = await Answer.findOne({
      attemptId: attempt._id,
      questionId,
    });

    // =================================================
    // CREATE REVIEW
    // =================================================

    if (!answer) {
      answer = await Answer.create({
        attemptId: attempt._id,
        questionId,

        selectedAnswer: null,

        isAttempted: false,

        isMarkedForReview: true,

        answeredAt: null,
      });
    }

    // =================================================
    // TOGGLE REVIEW
    // =================================================

    else {
      answer.isMarkedForReview =
        !Boolean(answer.isMarkedForReview);

      await answer.save();
    }

    return res.status(200).json({
      success: true,

      message: answer.isMarkedForReview
        ? "Question marked for review"
        : "Question removed from review",

      answer,
    });
  } catch (error) {
    console.error("Toggle Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review status",
      error: error.message,
    });
  }
};


