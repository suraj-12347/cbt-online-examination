import mongoose from "mongoose";

const systemSchema = new mongoose.Schema(
  {
    // =====================================================
    // System Name
    // Example: PC-01
    // =====================================================

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =====================================================
    // System Number
    // Example: 1
    // =====================================================

    systemNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    // =====================================================
    // Lab Name
    // =====================================================

    labName: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // IP Address
    // Optional
    // =====================================================

    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // MAC Address
    // Optional
    // =====================================================

    macAddress: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // System Status
    // =====================================================

    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "maintenance",
        "disabled",
      ],
      default: "available",
    },

    // =====================================================
    // Currently Assigned Scheduled Exam
    // =====================================================

    currentScheduledExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledExam",
      default: null,
    },

    // =====================================================
    // Last Used
    // =====================================================

    lastUsedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // Notes
    // =====================================================

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

// =====================================================
// Indexes
// =====================================================

systemSchema.index({
  status: 1,
});

systemSchema.index({
  labName: 1,
});

const System = mongoose.model("System", systemSchema);

export default System;