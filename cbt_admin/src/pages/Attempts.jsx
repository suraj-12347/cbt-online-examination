import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AttemptStats from "../components/attempts/AttemptStats";
import AttemptFilters from "../components/attempts/AttemptFilters";
import AttemptsTable from "../components/attempts/AttemptsTable";

import { getAllAttempts } from "../services/attemptApi";
import { getExams } from "../services/examApi";

const Attempts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] =
    useState([]);

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [exam, setExam] =
    useState("");

  // =====================================================
  // Fetch Attempts
  // =====================================================

  const fetchAttempts = async () => {
    try {
      setLoading(true);

      const response =
        await getAllAttempts();

      const data =
        response?.data?.attempts ||
        response?.data ||
        [];

      setAttempts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch attempts:",
        error
      );

      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Fetch Exams
  // =====================================================

  const fetchExams = async () => {
    try {
      const response =
        await getExams();

      const data =
        response?.data?.exams ||
        response?.data ||
        [];

      setExams(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch exams:",
        error
      );

      setExams([]);
    }
  };

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    fetchAttempts();
    fetchExams();
  }, []);

  // =====================================================
  // Filter Attempts
  // =====================================================

  const filteredAttempts =
    useMemo(() => {
      return attempts.filter(
        (attempt) => {
          const student =
            attempt.userId;

          const examData =
            attempt.examId;

          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchText ||
            student?.name
              ?.toLowerCase()
              .includes(searchText) ||
            student?.email
              ?.toLowerCase()
              .includes(searchText) ||
            student?.rollNo
              ?.toLowerCase()
              .includes(searchText) ||
            examData?.title
              ?.toLowerCase()
              .includes(searchText);

          const matchesStatus =
            !status ||
            attempt.status === status;

          const matchesExam =
            !exam ||
            examData?._id === exam;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesExam
          );
        }
      );
    }, [
      attempts,
      search,
      status,
      exam,
    ]);

  // =====================================================
  // Clear Filters
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setExam("");
  };

  // =====================================================
  // View Attempt
  // =====================================================

  const handleView = (id) => {
    navigate(
      `/attempts/${id}`
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attempts
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track and monitor student exam attempts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttempts}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* =================================================
          Stats
      ================================================= */}

      <AttemptStats
        attempts={attempts}
      />

      {/* =================================================
          Filters
      ================================================= */}

      <AttemptFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        exam={exam}
        setExam={setExam}
        exams={exams}
        onClear={clearFilters}
      />

      {/* =================================================
          Result Count
      ================================================= */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {filteredAttempts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800">
            {attempts.length}
          </span>{" "}
          attempts
        </p>
      </div>

      {/* =================================================
          Table
      ================================================= */}

      <AttemptsTable
        attempts={filteredAttempts}
        loading={loading}
        onView={handleView}
      />
    </div>
  );
};

export default Attempts;