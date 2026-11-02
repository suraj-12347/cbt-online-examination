import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ResultStats from "../components/results/ResultStats";
import ResultFilters from "../components/results/ResultFilters";
import ResultsTable from "../components/results/ResultsTable";

import {
  getAllResults,
} from "../services/resultApi";

import {
  getExams,
} from "../services/examApi";

const Results = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // =====================================================
  // Fetch Results
  // =====================================================

  const fetchResults = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllResults();

      setResults(
        response.data?.results || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch results:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load results"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // Fetch Exams
  // =====================================================

  const fetchExams = async () => {
    try {
      const response = await getExams();

      setExams(
        response.data?.exams ||
          response.data ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to fetch exams:",
        error
      );
    }
  };

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    fetchResults();
    fetchExams();
  }, []);

  // =====================================================
  // Filter Results
  // =====================================================

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const student = result.userId || {};
      const exam = result.examId || {};

      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        student.name
          ?.toLowerCase()
          .includes(searchText) ||
        student.email
          ?.toLowerCase()
          .includes(searchText) ||
        student.rollNo
          ?.toLowerCase()
          .includes(searchText) ||
        exam.title
          ?.toLowerCase()
          .includes(searchText);

      const matchesExam =
        !examFilter ||
        exam._id === examFilter;

      const matchesStatus =
        !statusFilter ||
        result.status === statusFilter;

      return (
        matchesSearch &&
        matchesExam &&
        matchesStatus
      );
    });
  }, [
    results,
    search,
    examFilter,
    statusFilter,
  ]);

  // =====================================================
  // Clear Filters
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setExamFilter("");
    setStatusFilter("");
  };

  // =====================================================
  // View Result
  // =====================================================

  const handleView = (result) => {
    navigate(`/results/${result._id}`);
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Results
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage student examination results.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchResults(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <ResultStats results={results} />

      {/* Filters */}
      <ResultFilters
        search={search}
        setSearch={setSearch}
        examFilter={examFilter}
        setExamFilter={setExamFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        exams={exams}
        onClear={clearFilters}
      />

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filteredResults.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {results.length}
          </span>{" "}
          results
        </p>
      </div>

      {/* Table */}
      <ResultsTable
        results={filteredResults}
        onView={handleView}
      />
    </div>
  );
};

export default Results;