import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    selectedAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    isAttempted: {
      type: Boolean,
      default: false,
    },

    isMarkedForReview: {
      type: Boolean,
      default: false,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
