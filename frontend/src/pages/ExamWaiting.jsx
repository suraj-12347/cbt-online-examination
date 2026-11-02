import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getScheduledExamById } from "../api/scheduledExamApi";

const ExamWaiting = () => {
  const navigate = useNavigate();
  const { scheduledExamId } = useParams();

  const [scheduledExam, setScheduledExam] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchScheduledExam = useCallback(async () => {
    try {
      const response = await getScheduledExamById(scheduledExamId);
      const data = response.data;

      const exam = data?.scheduledExam || data?.data || data;
      setScheduledExam(exam);

      if (exam?.startTime) {
        setRemaining(
          Math.max(0, new Date(exam.startTime).getTime() - Date.now())
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load scheduled exam."
      );
    } finally {
      setLoading(false);
    }
  }, [scheduledExamId]);

  useEffect(() => {
    fetchScheduledExam();
  }, [fetchScheduledExam]);

  useEffect(() => {
    if (!scheduledExam?.startTime) return;

    const timer = setInterval(() => {
      const time = Math.max(
        0,
        new Date(scheduledExam.startTime).getTime() - Date.now()
      );

      setRemaining(time);

      if (time <= 0) {
        clearInterval(timer);
        navigate(`/exams/${scheduledExamId}/start`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledExam, scheduledExamId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking exam...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const canStart =
    scheduledExam?.attendanceStatus === "verified" &&
    !!scheduledExam?.allocatedSystem;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold text-[#064273]">
          Please Wait
        </h1>

        <p className="mt-3 text-gray-600">
          Your exam will start automatically at the scheduled time.
        </p>

        <div className="mt-8 text-4xl font-bold text-gray-900 tabular-nums">
          {String(hours).padStart(2, "0")}:
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>

        <div className="mt-8 text-left space-y-3 bg-gray-50 rounded-lg p-4 text-sm">
          <p>
            <strong>Attendance:</strong>{" "}
            {scheduledExam?.attendanceStatus || "Pending"}
          </p>

          <p>
            <strong>System:</strong>{" "}
            {scheduledExam?.allocatedSystem || "Not allocated"}
          </p>

          <p>
            <strong>Exam Status:</strong>{" "}
            {scheduledExam?.status || "Scheduled"}
          </p>
        </div>

        {!canStart && (
          <p className="mt-5 text-sm text-orange-600">
            Please wait for attendance verification and system allocation.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamWaiting;
