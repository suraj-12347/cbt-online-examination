import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ExamInstructions from "./pages/ExamInstructions";
import ExamWaiting from "./pages/ExamWaiting";
import ExamPage from "./pages/ExamPage";
import ExamComplete from "./pages/ExamComplete";
import Login from "./pages/Login";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/"
  element={<Login />}
/>

        {/* Exam Instructions */}
        <Route
          path="/exams/:scheduledExamId/instructions"
          element={<ExamInstructions />}
        />

        {/* Waiting Screen */}
        <Route
          path="/exams/:scheduledExamId/waiting"
          element={<ExamWaiting />}
        />

        {/* Start Exam */}
        <Route
          path="/exams/:scheduledExamId/start"
          element={<ExamPage />}
        />

        {/* Exam Complete */}
        <Route
          path="/exams/:scheduledExamId/complete"
          element={<ExamComplete />}
        />

        {/* Root */}
        <Route
          path="/"
          element={<Navigate to="/exams" replace />}
        />

        {/* Invalid Route */}
        <Route
          path="*"
          element={<Navigate to="/exams" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;