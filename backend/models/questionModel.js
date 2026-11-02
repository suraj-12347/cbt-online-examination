import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // Exam Reference
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      
    },

    // Section Reference
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      
    },

    // Topic
    topic: {
      type: String,
      default: "",
      trim: true,
    },

    // Question
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Question Type
    type: {
      type: String,
      enum: ["mcq", "coding"],
      default: "mcq",
    },

    // MCQ Options
    options: [
      {
        text: {
          type: String,
          default: "",
          trim: true,
        },

        image: {
          type: String,
          default: null,
        },
      },
    ],

    // Correct Answer
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Marks
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Negative Marks
    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Question Image
    questionImage: {
      type: String,
      default: null,
    },

    // Image Alt Text
    imageAlt: {
      type: String,
      default: "",
      trim: true,
    },

    // Question Order
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;