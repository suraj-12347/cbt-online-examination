import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getScheduledExamById } from "../api/scheduledExamApi";

const ExamInstructions = () => {
  const navigate = useNavigate();
  const { scheduledExamId } = useParams();

  const [scheduledExam, setScheduledExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);

        const response = await getScheduledExamById(scheduledExamId);
        const data = response.data;

        setScheduledExam(data?.scheduledExam || data?.data || data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load scheduled exam."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [scheduledExamId]);

  const handleContinue = () => {
    if (!agreed) return;

    navigate(`/exams/${scheduledExamId}/waiting`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading exam...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const exam = scheduledExam?.examId;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#064273]">
          Exam Instructions
        </h1>

        <div className="mt-5 bg-blue-50 rounded-lg p-4">
          <p className="font-semibold text-gray-800">
            {exam?.title || "Online Assessment"}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
            <p>
              <span className="text-gray-500">Date:</span>{" "}
              {scheduledExam?.examDate
                ? new Date(scheduledExam.examDate).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <span className="text-gray-500">Start:</span>{" "}
              {scheduledExam?.startTime
                ? new Date(scheduledExam.startTime).toLocaleTimeString()
                : "-"}
            </p>

            <p>
              <span className="text-gray-500">End:</span>{" "}
              {scheduledExam?.endTime
                ? new Date(scheduledExam.endTime).toLocaleTimeString()
                : "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-gray-700">
          <p>1. Read all instructions carefully before starting the exam.</p>
          <p>2. The exam will start automatically at the scheduled time.</p>
          <p>3. Do not refresh or close the exam window during the test.</p>
          <p>4. Your answers will be submitted automatically when the exam ends.</p>
          <p>5. Use only the system allocated to you by the invigilator.</p>
          <p>6. Follow all instructions given by the invigilator.</p>
        </div>

        <label className="flex items-center gap-3 mt-8 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">
            I have read and understood all the instructions.
          </span>
        </label>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            disabled={!agreed}
            onClick={handleContinue}
            className="px-6 py-2.5 rounded-md bg-[#064273] text-white disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
