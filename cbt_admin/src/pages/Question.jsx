
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../services/axiosInstance";
import {
  getQuestions,
  deleteQuestion,
} from "../services/questionApi";

const Question = () => {
  const navigate = useNavigate();

  // =====================================================
  // States
  // =====================================================

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // =====================================================
  // Get All Questions
  // =====================================================

 const fetchQuestions = async () => {
  try {
    setLoading(true);

    const response = await getQuestions();

    setQuestions(response.data.questions || []);
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to load questions"
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =====================================================
  // Unique Filters
  // =====================================================

  const exams = useMemo(() => {
    const data = questions
      .map((q) => q.examId)
      .filter(Boolean);

    return [
      ...new Map(
        data.map((exam) => [
          exam._id,
          exam,
        ])
      ).values(),
    ];
  }, [questions]);

  const sections = useMemo(() => {
    const data = questions
      .map((q) => q.sectionId)
      .filter(Boolean);

    return [
      ...new Map(
        data.map((section) => [
          section._id,
          section,
        ])
      ).values(),
    ];
  }, [questions]);

  const topics = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((q) => q.topic)
          .filter(Boolean)
      ),
    ];
  }, [questions]);

  // =====================================================
  // Filter Questions
  // =====================================================

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const searchText =
        `${q.question || ""} ${q.topic || ""}`
          .toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesExam =
        !examFilter ||
        q.examId?._id === examFilter;

      const matchesSection =
        !sectionFilter ||
        q.sectionId?._id === sectionFilter;

      const matchesTopic =
        !topicFilter ||
        q.topic === topicFilter;

      const matchesType =
        !typeFilter ||
        q.type === typeFilter;

      return (
        matchesSearch &&
        matchesExam &&
        matchesSection &&
        matchesTopic &&
        matchesType
      );
    });
  }, [
    questions,
    search,
    examFilter,
    sectionFilter,
    topicFilter,
    typeFilter,
  ]);

  // =====================================================
  // Select All
  // =====================================================

  const isAllSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) =>
      selectedQuestions.includes(q._id)
    );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedQuestions((prev) =>
        prev.filter(
          (id) =>
            !filteredQuestions.some(
              (q) => q._id === id
            )
        )
      );
    } else {
      const ids = filteredQuestions.map(
        (q) => q._id
      );

      setSelectedQuestions((prev) => [
        ...new Set([...prev, ...ids]),
      ]);
    }
  };

  // =====================================================
  // Individual Select
  // =====================================================

  const handleSelectQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter(
            (questionId) =>
              questionId !== id
          )
        : [...prev, id]
    );
  };

  // =====================================================
  // Delete Single Question
  // =====================================================

 const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this question?"
  );

  if (!confirmDelete) return;

  try {
    await deleteQuestion(id);

    setQuestions((prev) =>
      prev.filter(
        (question) => question._id !== id
      )
    );

    setSelectedQuestions((prev) =>
      prev.filter(
        (questionId) => questionId !== id
      )
    );

    toast.success(
      "Question deleted successfully"
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to delete question"
    );
  }
};

  // =====================================================
  // Delete Selected Questions
  // =====================================================

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast.warning(
        "Please select at least one question"
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${selectedQuestions.length} selected question(s)?`
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedQuestions.map((id) =>
          axiosInstance.delete(
            `/questions/${id}`
          )
        )
      );

      setQuestions((prev) =>
        prev.filter(
          (question) =>
            !selectedQuestions.includes(
              question._id
            )
        )
      );

      setSelectedQuestions([]);

      toast.success(
        "Selected questions deleted successfully"
      );
    } catch (error) {
      console.error(
        "BULK DELETE ERROR:",
        error
      );

      toast.error(
        "Failed to delete selected questions"
      );
    }
  };

  // =====================================================
  // Clear Filters
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setExamFilter("");
    setSectionFilter("");
    setTopicFilter("");
    setTypeFilter("");
  };

  const hasFilters =
    search ||
    examFilter ||
    sectionFilter ||
    topicFilter ||
    typeFilter;

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Questions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage all exam questions
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/questions/add")
          }
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
        >
          <Plus size={18} />
          Add New Question
        </button>
      </div>

      {/* =================================================
          Search + Filters
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">

        <div className="flex items-center gap-2 mb-4">
          <Filter
            size={18}
            className="text-gray-600"
          />

          <h2 className="font-semibold text-gray-700">
            Filters
          </h2>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <X size={15} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Search */}

          <div className="relative lg:col-span-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search question..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Exam */}

          <select
            value={examFilter}
            onChange={(e) =>
              setExamFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">
              All Exams
            </option>

            {exams.map((exam) => (
              <option
                key={exam._id}
                value={exam._id}
              >
                {exam.title}
              </option>
            ))}
          </select>

          {/* Section */}

          <select
            value={sectionFilter}
            onChange={(e) =>
              setSectionFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">
              All Sections
            </option>

            {sections.map((section) => (
              <option
                key={section._id}
                value={section._id}
              >
                {section.name}
              </option>
            ))}
          </select>

          {/* Topic */}

          <select
            value={topicFilter}
            onChange={(e) =>
              setTopicFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">
              All Topics
            </option>

            {topics.map((topic) => (
              <option
                key={topic}
                value={topic}
              >
                {topic}
              </option>
            ))}
          </select>

          {/* Type */}

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">
              All Types
            </option>

            <option value="mcq">
              MCQ
            </option>

            <option value="coding">
              Coding
            </option>
          </select>

        </div>
      </div>

      {/* =================================================
          Bulk Action Bar
      ================================================= */}

      {selectedQuestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">

          <span className="text-sm text-blue-700 font-medium">
            {selectedQuestions.length} question(s)
            selected
          </span>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      {/* =================================================
          Questions Table
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Table Header */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  #
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Question
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Topic
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Section
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Marks
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Negative
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Action
                </th>

              </tr>

            </thead>

            {/* =================================================
                Loading
            ================================================= */}

            {loading ? (
              <tbody>
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-12 text-gray-500"
                  >
                    Loading questions...
                  </td>
                </tr>
              </tbody>
            ) : filteredQuestions.length === 0 ? (

              /* =================================================
                  Empty
              ================================================= */

              <tbody>
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-12"
                  >
                    <div className="text-gray-400 mb-2">
                      No questions found
                    </div>

                    <p className="text-sm text-gray-500">
                      Try changing your filters
                    </p>
                  </td>
                </tr>
              </tbody>

            ) : (

              /* =================================================
                  Questions
              ================================================= */

              <tbody className="divide-y divide-gray-100">

                {filteredQuestions.map(
                  (q, index) => (

                    <tr
                      key={q._id}
                      className="hover:bg-gray-50 transition"
                    >

                      {/* Checkbox */}

                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(
                            q._id
                          )}
                          onChange={() =>
                            handleSelectQuestion(
                              q._id
                            )
                          }
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </td>

                      {/* Number */}

                      <td className="px-4 py-4 text-sm font-medium text-gray-600">
                        {q.order || index + 1}
                      </td>

                      {/* Question */}

                      <td className="px-4 py-4 max-w-[350px]">
                        <div className="font-medium text-gray-800 line-clamp-2">
                          {q.question}
                        </div>

                        {q.questionImage && (
                          <span className="text-xs text-blue-500 mt-1 inline-block">
                            Image attached
                          </span>
                        )}

                        <div className="text-xs text-gray-400 mt-1">
                          {q.options?.length || 0} options
                        </div>
                      </td>

                      {/* Topic */}

                      <td className="px-4 py-4">
                        {q.topic ? (
                          <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                            {q.topic}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            —
                          </span>
                        )}
                      </td>

                      {/* Section */}

                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-700">
                          {q.sectionId?.name ||
                            "—"}
                        </div>

                        {q.sectionId?.shortName && (
                          <div className="text-xs text-gray-400">
                            {q.sectionId.shortName}
                          </div>
                        )}
                      </td>

                      {/* Type */}

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            q.type === "coding"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {q.type === "coding"
                            ? "Coding"
                            : "MCQ"}
                        </span>
                      </td>

                      {/* Marks */}

                      <td className="px-4 py-4 text-sm font-medium text-green-600">
                        +{q.marks}
                      </td>

                      {/* Negative */}

                      <td className="px-4 py-4 text-sm font-medium text-red-500">
                        -{q.negativeMarks}
                      </td>

                      {/* Actions */}

                      <td className="px-4 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* Edit */}

                          <button
                            onClick={() =>
                              navigate(
                                `/questions/edit/${q._id}`
                              )
                            }
                            title="Edit Question"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Edit size={17} />
                          </button>

                          {/* Delete */}

                          <button
                            onClick={() =>
                              handleDelete(q._id)
                            }
                            title="Delete Question"
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            )}

          </table>

        </div>

        {/* =================================================
            Footer
        ================================================= */}

        {!loading &&
          filteredQuestions.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {filteredQuestions.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {questions.length}
                </span>{" "}
                questions
              </p>

              <p className="text-sm text-gray-500">
                {selectedQuestions.length} selected
              </p>

            </div>
          )}

      </div>
    </div>
  );
};

export default Question;
