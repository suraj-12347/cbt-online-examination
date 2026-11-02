
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import {
  autoUpdateScheduledExams,
} from "./controllers/scheduledExamController.js";

import systemRoutes from "./routes/systemRoutes.js";
import invigilatorRoutes from "./routes/invigilatorRoutes.js";
import scheduledExamRoutes from "./routes/scheduledExamRoutes.js";

dotenv.config();

connectDB();

const app = express();

// =====================================================
// Static Uploads
// URL: http://localhost:4000/api/uploads/...
// =====================================================

app.use("/api/uploads", express.static("uploads"));

app.use(cors());
app.use(express.json());

// =====================================================
// Routes
// =====================================================

app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/scheduled-exams", scheduledExamRoutes);
app.use("/api/systems", systemRoutes);
app.use("/api/invigilators", invigilatorRoutes);

// =====================================================
// Health Check
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "CBT Backend API is running",
  });
});

// =====================================================
// Server
// =====================================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// =====================================================
// AUTO EXAM STATUS CHECK
//
// scheduled + startTime reached
//        ↓
//     active
//
// active + endTime reached
//        ↓
//   completed
// =====================================================

  autoUpdateScheduledExams();

setInterval(() => {
  autoUpdateScheduledExams();
}, 1000);

