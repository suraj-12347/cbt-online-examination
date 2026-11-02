import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    // =====================================================
    // Attempt Reference
    // =====================================================

    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
      unique: true,
    },

    // =====================================================
    // Student Reference
    // =====================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // Exam Reference
    // =====================================================

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    // =====================================================
    // Question Statistics
    // =====================================================

    totalQuestions: {
      type: Number,
      default: 0,
    },

    attempted: {
      type: Number,
      default: 0,
    },

    correct: {
      type: Number,
      default: 0,
    },

    wrong: {
      type: Number,
      default: 0,
    },

    skipped: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // Marks
    // =====================================================

    positiveMarks: {
      type: Number,
      default: 0,
    },

    negativeMarks: {
      type: Number,
      default: 0,
    },

    // Maximum marks of exam
    maxMarks: {
      type: Number,
      default: 0,
    },

    // Final obtained marks
    obtainedMarks: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // Percentage
    // =====================================================

    percentage: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // Result Status
    // =====================================================

    status: {
      type: String,
      enum: ["passed", "failed", "pending"],
      default: "pending",
    },

    // =====================================================
    // Result Calculation Time
    // =====================================================

    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// Indexes
// =====================================================

resultSchema.index({
  userId: 1,
});

resultSchema.index({
  examId: 1,
});

resultSchema.index({
  status: 1,
});

resultSchema.index({
  createdAt: -1,
});

const Result = mongoose.model("Result", resultSchema);

export default Result;