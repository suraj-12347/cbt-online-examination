import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    // =====================================================
    // Student
    // =====================================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // Exam
    // =====================================================
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    // =====================================================
    // Scheduled Exam
    // =====================================================
    scheduledExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledExam",
      default: null,
    },

    // =====================================================
    // Current Section
    // =====================================================
    currentSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },

    // =====================================================
    // Current Question
    // =====================================================
    currentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },

    // =====================================================
    // Attempt Timing
    // =====================================================
    startedAt: {
      type: Date,
      default: Date.now,
    },

    sectionStartedAt: {
      type: Date,
      default: null,
    },

    sectionEndsAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // Attempt Status
    // =====================================================
    status: {
      type: String,
      enum: [
        "started",
        "completed",
        "expired",
        "abandoned",
      ],
      default: "started",
    },

    // =====================================================
    // Question Statistics
    // =====================================================
    totalQuestions: {
      type: Number,
      default: 0,
    },

    attemptedQuestions: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    wrongAnswers: {
      type: Number,
      default: 0,
    },

    skippedQuestions: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // Marks / Performance
    // =====================================================
    totalMarks: {
      type: Number,
      default: 0,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// Indexes
// =====================================================

attemptSchema.index({
  userId: 1,
  examId: 1,
});

attemptSchema.index({
  status: 1,
});

attemptSchema.index({
  examId: 1,
});

attemptSchema.index({
  scheduledExamId: 1,
});

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;