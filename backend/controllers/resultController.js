import Result from "../models/resultModel.js";
import Attempt from "../models/attemptModel.js";
import Answer from "../models/answerModel.js";
import Question from "../models/questionModel.js";

// =====================================================
// Calculate Result
// =====================================================

export const calculateResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // -------------------------------------------------
    // Get Attempt
    // -------------------------------------------------

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found",
      });
    }

    // -------------------------------------------------
    // Check User
    // -------------------------------------------------

    if (
      req.user &&
      attempt.userId.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // -------------------------------------------------
    // Attempt should be completed
    // -------------------------------------------------

    if (attempt.status !== "completed") {
      return res.status(400).json({
        message: "Exam is not submitted yet",
      });
    }

    // -------------------------------------------------
    // Check Existing Result
    // -------------------------------------------------

    const existingResult = await Result.findOne({
      attemptId,
    });

    if (existingResult) {
      return res.status(200).json({
        message: "Result already calculated",
        result: existingResult,
      });
    }

    // -------------------------------------------------
    // Get Questions
    // -------------------------------------------------

    const questions = await Question.find({
      examId: attempt.examId,
    });

    // -------------------------------------------------
    // Get Answers
    // -------------------------------------------------

    const answers = await Answer.find({
      attemptId,
    });

    // -------------------------------------------------
    // Create Answer Map
    // -------------------------------------------------

    const answerMap = new Map();

    answers.forEach((answer) => {
      answerMap.set(
        answer.questionId.toString(),
        answer
      );
    });

    // -------------------------------------------------
    // Statistics
    // -------------------------------------------------

    let attempted = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    let positiveMarks = 0;
    let negativeMarks = 0;

    // -------------------------------------------------
    // Calculate Question Wise Result
    // -------------------------------------------------

    for (const question of questions) {
      const answer = answerMap.get(
        question._id.toString()
      );

      // -----------------------------------------------
      // Skipped Question
      // -----------------------------------------------

      if (
        !answer ||
        answer.selectedAnswer === null ||
        answer.selectedAnswer === undefined ||
        answer.selectedAnswer === ""
      ) {
        skipped++;
        continue;
      }

      attempted++;

      // -----------------------------------------------
      // Check Correct Answer
      // -----------------------------------------------

      const isCorrect =
        String(answer.selectedAnswer) ===
        String(question.correctAnswer);

      // -----------------------------------------------
      // Correct
      // -----------------------------------------------

      if (isCorrect) {
        correct++;

        positiveMarks += Number(
          question.marks || 0
        );
      }

      // -----------------------------------------------
      // Wrong
      // -----------------------------------------------

      else {
        wrong++;

        negativeMarks += Number(
          question.negativeMarks || 0
        );
      }
    }

    // =================================================
    // Marks Calculation
    // =================================================

    const obtainedMarks =
      positiveMarks - negativeMarks;

    const maxMarks = questions.reduce(
      (total, question) =>
        total + Number(question.marks || 0),
      0
    );

    // =================================================
    // Percentage
    // =================================================

    const percentage =
      maxMarks > 0
        ? Number(
            ((obtainedMarks / maxMarks) * 100).toFixed(2)
          )
        : 0;

    // =================================================
    // Pass / Fail
    // =================================================
    // Currently 40% passing criteria
    // You can make this exam-wise later.

    const status =
      percentage >= 40
        ? "passed"
        : "failed";

    // =================================================
    // Create Result
    // =================================================

    const result = await Result.create({
      attemptId,

      userId: attempt.userId,

      examId: attempt.examId,

      totalQuestions: questions.length,

      attempted,

      correct,

      wrong,

      skipped,

      positiveMarks,

      negativeMarks,

      maxMarks,

      obtainedMarks,

      percentage,

      status,

      calculatedAt: new Date(),
    });

    // =================================================
    // Response
    // =================================================

    res.status(201).json({
      message: "Result calculated successfully",
      result,
    });
  } catch (error) {
    console.error("Calculate Result Error:", error);

    res.status(500).json({
      message: "Failed to calculate result",
      error: error.message,
    });
  }
};

// =====================================================
// Get Result By Attempt
// =====================================================

export const getResultByAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const result = await Result.findOne({
      attemptId,
    })
      .populate(
        "userId",
        "name email rollNo course branch semester image"
      )
      .populate(
        "examId",
        "title description duration totalMarks"
      );

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    // -------------------------------------------------
    // Check User
    // -------------------------------------------------

    if (
      req.user &&
      result.userId._id.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Get Result Error:", error);

    res.status(500).json({
      message: "Failed to get result",
      error: error.message,
    });
  }
};

// =====================================================
// Get All Results
// Admin Results Page
// =====================================================

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate(
        "userId",
        "name email rollNo course branch semester image"
      )
      .populate(
        "examId",
        "title description duration totalMarks"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get All Results Error:", error);

    res.status(500).json({
      message: "Failed to get results",
      error: error.message,
    });
  }
};

// =====================================================
// Get Result By ID
// Admin Result Details
// =====================================================

export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate(
        "userId",
        "name email rollNo course branch semester image"
      )
      .populate(
        "examId",
        "title description duration totalMarks"
      )
      .populate("attemptId");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Get Result By ID Error:", error);

    res.status(500).json({
      message: "Failed to get result",
      error: error.message,
    });
  }
};