import mongoose from "mongoose";

const scheduledExamSchema = new mongoose.Schema(
  {
    // ==========================================
    // Exam
    // ==========================================
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    // ==========================================
    // Student
    // ==========================================
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Invigilator
    // Admin assign karega
    // ==========================================
    invigilatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invigilator",
      default: null,
    },

    // ==========================================
    // Exam Date
    // ==========================================
    examDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // Exact Start Time
    // ==========================================
    startTime: {
      type: Date,
      required: true,
    },

    // ==========================================
    // Exact End Time
    // ==========================================
    endTime: {
      type: Date,
      required: true,
    },

    // ==========================================
    // Admin-controlled Exam Status
    // ==========================================
    status: {
      type: String,
      enum: [
        "scheduled",
        "active",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
    },

    // ==========================================
    // Invigilator Attendance Verification
    // ==========================================
    attendanceStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "absent",
      ],
      default: "pending",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invigilator",
      default: null,
    },

    // ==========================================
    // System / Computer Allocation
    // ==========================================
    allocatedSystem: {
      type: String,
      default: null,
      trim: true,
    },

    allocatedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // Exam Access
    // Backend will decide actual access
    // based on date/time + verification etc.
    // ==========================================
    accessGranted: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // Additional Notes
    // ==========================================
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Indexes
// ==========================================

scheduledExamSchema.index({
  examId: 1,
});

scheduledExamSchema.index({
  studentId: 1,
});

scheduledExamSchema.index({
  invigilatorId: 1,
});

scheduledExamSchema.index({
  startTime: 1,
});

scheduledExamSchema.index({
  endTime: 1,
});

scheduledExamSchema.index({
  status: 1,
});

scheduledExamSchema.index({
  attendanceStatus: 1,
});

// Same student ko same exam multiple baar
// accidentally schedule nahi kar sakte
scheduledExamSchema.index(
  {
    examId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

const ScheduledExam = mongoose.model(
  "ScheduledExam",
  scheduledExamSchema
);

export default ScheduledExam;