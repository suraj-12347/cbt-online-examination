
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginStudent } from "../api/studentApi";
import { getStudentScheduledExams } from "../api/scheduledExamApi";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // Handle Input
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // Login
  // =====================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // =================================================
      // Student Login - Render API
      // =================================================
      const data = await loginStudent({
        email: formData.email.trim(),
        password: formData.password,
      });

      const student = data?.user;
      const token = data?.token;

      if (!student?.id) {
        setError("Student information not found.");
        return;
      }

      if (!token) {
        setError("Login token not received.");
        return;
      }

      // =================================================
      // Save Student Session
      // =================================================
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentToken", token);

      // =================================================
      // Get Scheduled Exams
      // =================================================
      const scheduledResponse = await getStudentScheduledExams(
        student.id
      );

      // Axios response handling
      const scheduledData = scheduledResponse.data;

      console.log("Scheduled Exam Response:", scheduledData);

      const scheduledExams =
        scheduledData?.scheduledExams ||
        scheduledData?.data ||
        [];

      // =================================================
      // No Exam Scheduled
      // =================================================
      if (!Array.isArray(scheduledExams) || !scheduledExams.length) {
        setError("No exam has been scheduled for you.");
        return;
      }

      // =================================================
      // Find Upcoming / Active Exam
      // =================================================
      const now = new Date();

      const validExam = scheduledExams.find((item) => {
        if (
          item.status === "completed" ||
          item.status === "cancelled"
        ) {
          return false;
        }

        if (!item.startTime || !item.endTime) {
          return false;
        }

        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);

        return (
          !Number.isNaN(startTime.getTime()) &&
          !Number.isNaN(endTime.getTime()) &&
          endTime > now
        );
      });

      // =================================================
      // No Valid Exam
      // =================================================
      if (!validExam) {
        setError("No active or upcoming exam found.");
        return;
      }

      // =================================================
      // Validate Scheduled Exam ID
      // =================================================
      if (!validExam._id) {
        setError("Scheduled exam ID not found.");
        return;
      }

      // =================================================
      // Save Scheduled Exam ID
      // =================================================
      localStorage.setItem(
        "scheduledExamId",
        validExam._id
      );

      // =================================================
      // Navigate To Instructions
      // =================================================
      navigate(
        `/exams/${validExam._id}/instructions`,
        { replace: true }
      );

    } catch (error) {
      console.error("Student Login Error:", error);

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-[#064273]">
              Student Login
            </h1>

            <p className="text-gray-500 mt-2">
              Login to start your online assessment
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="username"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#064273] focus:ring-1 focus:ring-[#064273]"
                disabled={loading}
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#064273] focus:ring-1 focus:ring-[#064273]"
                disabled={loading}
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064273] hover:bg-[#05345b] text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;
