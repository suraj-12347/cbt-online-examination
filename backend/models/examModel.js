import mongoose from "mongoose";

// =====================================================
// Exam Section Schema
// =====================================================

const examSectionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    // Section duration for this particular exam
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    // Section order inside exam
    order: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// Exam Schema
// =====================================================

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    negativeMarking: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },

    // =================================================
    // Sections selected for this exam
    // =================================================

    sections: {
      type: [examSectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;