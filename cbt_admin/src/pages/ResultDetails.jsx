import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  UserRound,
  FileText,
  Award,
  Target,
  Clock3,
  CalendarDays,
  Mail,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getResultById } from "../services/resultApi";

const ResultDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Fetch Result
  // =====================================================

  const fetchResult = async () => {
    try {
      setLoading(true);

      const response = await getResultById(id);

      setResult(response.data?.result || null);
    } catch (error) {
      console.error(
        "Failed to fetch result:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load result"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [id]);

  // =====================================================
  // Format Date
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading result...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // Result Not Found
  // =====================================================

  if (!result) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <FileText
            size={48}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Result Not Found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The requested result could not be found.
          </p>

          <button
            onClick={() => navigate("/results")}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const student = result.userId || {};
  const exam = result.examId || {};

  const percentage = Number(
    result.percentage || 0
  ).toFixed(2);

  const status = result.status || "pending";

  const statusStyles = {
    passed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6 p-6">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/results")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Result Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Detailed examination result
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
            statusStyles[status] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* =================================================
          Student + Exam Information
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student Information */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <UserRound
              size={20}
              className="text-blue-600"
            />

            <h2 className="font-semibold text-gray-800">
              Student Information
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
              {student.image ? (
                <img
                  src={student.image}
                  alt={student.name || "Student"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={28}
                  className="text-blue-600"
                />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {student.name || "-"}
              </h3>

              <p className="text-sm text-gray-500">
                Roll No: {student.rollNo || "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail
                size={17}
                className="text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Email
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {student.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen
                size={17}
                className="text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Course
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {student.course || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target
                size={17}
                className="text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Branch
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {student.branch || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Information */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText
              size={20}
              className="text-blue-600"
            />

            <h2 className="font-semibold text-gray-800">
              Examination Information
            </h2>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            {exam.title || "-"}
          </h3>

          {exam.description && (
            <p className="mt-2 text-sm text-gray-500">
              {exam.description}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Maximum Marks
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {result.maxMarks ?? 0}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Duration
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {exam.duration || 0} min
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <CalendarDays
              size={17}
              className="text-gray-400"
            />

            <div>
              <p className="text-xs text-gray-400">
                Result Calculated
              </p>

              <p className="text-sm font-medium text-gray-700">
                {formatDate(
                  result.calculatedAt ||
                    result.createdAt
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          Score Overview
      ================================================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Award
            size={20}
            className="text-blue-600"
          />

          <h2 className="font-semibold text-gray-800">
            Score Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Obtained Marks */}

          <div className="rounded-xl bg-blue-50 p-5">
            <p className="text-sm text-blue-600">
              Obtained Marks
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {result.obtainedMarks ?? 0}
            </p>

            <p className="mt-1 text-xs text-blue-500">
              out of {result.maxMarks ?? 0}
            </p>
          </div>

          {/* Percentage */}

          <div className="rounded-xl bg-purple-50 p-5">
            <p className="text-sm text-purple-600">
              Percentage
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-700">
              {percentage}%
            </p>
          </div>

          {/* Positive */}

          <div className="rounded-xl bg-green-50 p-5">
            <p className="text-sm text-green-600">
              Positive Marks
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              +{result.positiveMarks ?? 0}
            </p>
          </div>

          {/* Negative */}

          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-sm text-red-600">
              Negative Marks
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              -{result.negativeMarks ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          Question Statistics
      ================================================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Target
            size={20}
            className="text-blue-600"
          />

          <h2 className="font-semibold text-gray-800">
            Question Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Total */}

          <div className="rounded-xl border border-gray-100 p-5 text-center">
            <FileText
              size={24}
              className="mx-auto text-gray-500"
            />

            <p className="mt-3 text-2xl font-bold text-gray-800">
              {result.totalQuestions ?? 0}
            </p>

            <p className="text-sm text-gray-500">
              Total Questions
            </p>
          </div>

          {/* Correct */}

          <div className="rounded-xl border border-green-100 bg-green-50 p-5 text-center">
            <CheckCircle2
              size={24}
              className="mx-auto text-green-600"
            />

            <p className="mt-3 text-2xl font-bold text-green-700">
              {result.correct ?? 0}
            </p>

            <p className="text-sm text-green-600">
              Correct
            </p>
          </div>

          {/* Wrong */}

          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
            <XCircle
              size={24}
              className="mx-auto text-red-600"
            />

            <p className="mt-3 text-2xl font-bold text-red-700">
              {result.wrong ?? 0}
            </p>

            <p className="text-sm text-red-600">
              Wrong
            </p>
          </div>

          {/* Skipped */}

          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 text-center">
            <MinusCircle
              size={24}
              className="mx-auto text-yellow-600"
            />

            <p className="mt-3 text-2xl font-bold text-yellow-700">
              {result.skipped ?? 0}
            </p>

            <p className="text-sm text-yellow-600">
              Skipped
            </p>
          </div>
        </div>

        {/* Attempted */}

        <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock3
              size={18}
              className="text-gray-500"
            />

            <span className="text-sm text-gray-600">
              Attempted Questions
            </span>
          </div>

          <span className="font-semibold text-gray-800">
            {result.attempted ?? 0} /{" "}
            {result.totalQuestions ?? 0}
          </span>
        </div>
      </div>

      {/* =================================================
          Result Summary
      ================================================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-800">
          Result Summary
        </h2>

        <div className="rounded-lg bg-gray-50 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Final Result
              </p>

              <p className="mt-1 text-xl font-bold capitalize text-gray-900">
                {status}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500">
                Final Score
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {result.obtainedMarks ?? 0} /{" "}
                {result.maxMarks ?? 0}
              </p>
            </div>
          </div>

          {/* Progress */}

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>Performance</span>
              <span>{percentage}%</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(
                      Number(result.percentage || 0),
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          Back Button
      ================================================= */}

      <div>
        <button
          onClick={() => navigate("/results")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={17} />
          Back to Results
        </button>
      </div>
    </div>
  );
};

export default ResultDetails;