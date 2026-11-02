
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

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "https://cbt-online-examination-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use("/api/uploads", express.static("uploads"));

// =====================================================
// ROUTES
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
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CBT Backend API is running",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initial scheduled exam status check
    autoUpdateScheduledExams().catch((error) => {
      console.error("Scheduled exam update error:", error);
    });

    // Check every second
    setInterval(() => {
      autoUpdateScheduledExams().catch((error) => {
        console.error("Scheduled exam update error:", error);
      });
    }, 1000);

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
