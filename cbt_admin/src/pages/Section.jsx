
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Shuffle,
  Layers,
  Clock,
  FileQuestion,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../services/sectionApi";

import {
  getQuestions,
  updateQuestion,
} from "../services/questionApi";

const Section = () => {
  // =========================
  // Section States
  // =========================
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [sectionForm, setSectionForm] = useState({
  name: "",
  shortName: "",
  duration: 1,
  order: 1,
});

  // =========================
  // Question States
  // =========================
  const [questions, setQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const [randomCount, setRandomCount] = useState("");

  // =========================
  // Load Sections
  // =========================
  const loadSections = async () => {
    try {
      setLoading(true);

      const res = await getSections();

      setSections(res.data?.sections || res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Load Questions
  // =========================
  const loadQuestions = async () => {
    try {
      const res = await getQuestions();

      setQuestions(res.data?.questions || res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
    }
  };

  useEffect(() => {
    loadSections();
    loadQuestions();
  }, []);

  // =========================
  // Section Form Change
  // =========================
  const handleSectionChange = (e) => {
    const { name, value } = e.target;

    setSectionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Open Add Section
  // =========================
const openAddSection = () => {
  setEditingSection(null);

  setSectionForm({
    name: "",
    shortName: "",
    duration: 1,
    order: sections.length + 1,
  });

  setShowSectionModal(true);
};

  // =========================
  // Open Edit Section
  // =========================
 const openEditSection = (section) => {
  setEditingSection(section);

  setSectionForm({
    name: section.name || "",
    shortName: section.shortName || "",
    duration: section.duration || 1,
    order: section.order || 1,
  });

  setShowSectionModal(true);
};

  // =========================
  // Save Section
  // =========================
const handleSectionSubmit = async (e) => {
  e.preventDefault();

  if (!sectionForm.name.trim()) {
    toast.error("Section name is required");
    return;
  }

  if (!sectionForm.shortName.trim()) {
    toast.error("Short name is required");
    return;
  }

  try {
    const data = {
      name: sectionForm.name.trim(),
      shortName: sectionForm.shortName.trim(),
      duration: Number(sectionForm.duration),
      order: Number(sectionForm.order),
    };

    if (editingSection) {
      await updateSection(editingSection._id, data);
      toast.success("Section updated successfully");
    } else {
      await createSection(data);
      toast.success("Section created successfully");
    }

    setShowSectionModal(false);
    loadSections();
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};

  // =========================
  // Delete Section
  // =========================
  const handleDeleteSection = async (section) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${section.name || section.title}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteSection(section._id);

      toast.success("Section deleted successfully");

      loadSections();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to delete section"
      );
    }
  };

  // =========================
  // Open Question Assignment
  // =========================
  const openQuestionAssignment = async (section) => {
    setSelectedSection(section);

    // Existing questions belonging to this section
    const existingQuestionIds = questions
      .filter(
        (question) =>
          String(
            question.sectionId?._id || question.sectionId || ""
          ) === String(section._id)
      )
      .map((question) => question._id);

    setSelectedQuestions(existingQuestionIds);

    // Reset filters
    setSearch("");
    setTypeFilter("");
    setTopicFilter("");
    setDifficultyFilter("");
    setRandomCount("");

    setShowQuestionModal(true);

    // Refresh questions
    await loadQuestions();
  };

  // =========================
  // Filter Options
  // =========================
  const typeOptions = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) => question.type)
          .filter(Boolean)
      ),
    ];
  }, [questions]);

  const topicOptions = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) => question.topic)
          .filter(Boolean)
      ),
    ];
  }, [questions]);

  const difficultyOptions = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) => question.difficulty)
          .filter(Boolean)
      ),
    ];
  }, [questions]);

  // =========================
  // Filter Questions
  // =========================
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const questionText = String(
        question.question || question.title || ""
      ).toLowerCase();

      const searchMatch = questionText.includes(
        search.toLowerCase()
      );

      const typeMatch =
        !typeFilter ||
        String(question.type || "") === String(typeFilter);

      const topicMatch =
        !topicFilter ||
        String(question.topic || "") === String(topicFilter);

      const difficultyMatch =
        !difficultyFilter ||
        String(question.difficulty || "") ===
          String(difficultyFilter);

      return (
        searchMatch &&
        typeMatch &&
        topicMatch &&
        difficultyMatch
      );
    });
  }, [
    questions,
    search,
    typeFilter,
    topicFilter,
    difficultyFilter,
  ]);

  // =========================
  // Select One Question
  // =========================
  const toggleQuestion = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }

      return [...prev, questionId];
    });
  };

  // =========================
  // Select All Filtered
  // =========================
  const handleSelectAll = () => {
    const filteredIds = filteredQuestions.map(
      (question) => question._id
    );

    const allSelected = filteredIds.every((id) =>
      selectedQuestions.includes(id)
    );

    if (allSelected) {
      setSelectedQuestions((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedQuestions((prev) => [
        ...new Set([...prev, ...filteredIds]),
      ]);
    }
  };

  // =========================
  // Random Questions
  // =========================
  const handleRandomQuestions = () => {
    const count = Number(randomCount);

    if (!count || count <= 0) {
      toast.error("Enter a valid number of questions");
      return;
    }

    if (count > filteredQuestions.length) {
      toast.error(
        `Only ${filteredQuestions.length} questions available`
      );
      return;
    }

    // Shuffle questions
    const shuffled = [...filteredQuestions].sort(
      () => Math.random() - 0.5
    );

    const randomQuestions = shuffled
      .slice(0, count)
      .map((question) => question._id);

    setSelectedQuestions(randomQuestions);

    toast.success(`${count} questions randomly selected`);
  };

  // =========================
  // Save Questions
  // =========================
  const handleSaveQuestions = async () => {
    if (!selectedSection) return;

    try {
      // Questions currently assigned to this section
      const currentSectionQuestions = questions.filter(
        (question) =>
          String(
            question.sectionId?._id ||
              question.sectionId ||
              ""
          ) === String(selectedSection._id)
      );

      const currentIds = currentSectionQuestions.map(
        (question) => question._id
      );

      // Questions which need to be assigned
      const questionsToAssign = questions.filter((question) =>
        selectedQuestions.includes(question._id)
      );

      // Questions which need to be removed
      const questionsToRemove = currentSectionQuestions.filter(
        (question) =>
          !selectedQuestions.includes(question._id)
      );

      // Assign selected questions
      for (const question of questionsToAssign) {
        const alreadyAssigned = currentIds.includes(
          question._id
        );

        if (!alreadyAssigned) {
          await updateQuestion(question._id, {
            sectionId: selectedSection._id,
          });
        }
      }

      // Remove questions from this section
      for (const question of questionsToRemove) {
        await updateQuestion(question._id, {
          sectionId: "",
        });
      }

      toast.success("Questions updated successfully");

      setShowQuestionModal(false);

      await loadQuestions();
      await loadSections();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update questions"
      );
    }
  };

  // =========================
  // Clear Filters
  // =========================
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setTopicFilter("");
    setDifficultyFilter("");
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Sections
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage exam sections and assign questions
          </p>
        </div>

        <button
          onClick={openAddSection}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium"
        >
          <Plus size={18} />
          Add New Section
        </button>

      </div>

      {/* ================= SECTION LIST ================= */}
      {loading ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">
          Loading sections...
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <Layers
            size={40}
            className="mx-auto text-gray-400 mb-3"
          />

          <h3 className="font-semibold text-gray-700">
            No sections found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Create your first section
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {sections.map((section) => {

            const sectionQuestionCount = questions.filter(
              (question) =>
                String(
                  question.sectionId?._id ||
                    question.sectionId ||
                    ""
                ) === String(section._id)
            ).length;

            return (
  <div
    key={section._id}
    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
  >
    {/* ================= SECTION HEADER ================= */}
    <div className="flex items-start justify-between gap-3">

      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {section.name || section.title}
        </h2>

        {/* Short Name */}
        <p className="text-sm text-blue-600 font-medium mt-1">
          {section.shortName}
        </p>
      </div>

      {/* Edit / Delete */}
      <div className="flex gap-1">

        <button
          onClick={() => openEditSection(section)}
          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
          title="Edit Section"
        >
          <Pencil size={17} />
        </button>

        <button
          onClick={() => handleDeleteSection(section)}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
          title="Delete Section"
        >
          <Trash2 size={17} />
        </button>

      </div>
    </div>

    {/* ================= SECTION INFORMATION ================= */}
    <div className="grid grid-cols-3 gap-2 mt-5">

      {/* Duration */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Clock
          size={17}
          className="mx-auto text-gray-500"
        />

        <p className="text-sm font-semibold mt-1">
          {section.duration || 0}
        </p>

        <p className="text-xs text-gray-500">
          Minutes
        </p>
      </div>

      {/* Questions */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <FileQuestion
          size={17}
          className="mx-auto text-gray-500"
        />

        <p className="text-sm font-semibold mt-1">
          {sectionQuestionCount}
        </p>

        <p className="text-xs text-gray-500">
          Questions
        </p>
      </div>

      {/* Order */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Layers
          size={17}
          className="mx-auto text-gray-500"
        />

        <p className="text-sm font-semibold mt-1">
          {section.order || 0}
        </p>

        <p className="text-xs text-gray-500">
          Order
        </p>
      </div>

    </div>

    {/* ================= MANAGE QUESTIONS ================= */}
    <button
      onClick={() => openQuestionAssignment(section)}
      className="w-full mt-5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-lg font-medium text-sm"
    >
      Manage Questions
    </button>

  </div>
);
          })}

        </div>
      )}

      {/* ================================================= */}
      {/* ADD / EDIT SECTION MODAL */}
      {/* ================================================= */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">

              <div>
                <h2 className="text-lg font-semibold">
                  {editingSection
                    ? "Edit Section"
                    : "Add New Section"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter section details
                </p>
              </div>

              <button
                onClick={() =>
                  setShowSectionModal(false)
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSectionSubmit}
              className="p-5 space-y-4"
            >

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionChange}
                  placeholder="e.g. Numerical Ability"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Short Name */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Short Name
  </label>

  <input
    type="text"
    name="shortName"
    value={sectionForm.shortName}
    onChange={handleSectionChange}
    placeholder="e.g. Numerical"
    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

              {/* Description */}
              <div>
               
              </div>

              {/* Duration + Order */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="duration"
                    value={sectionForm.duration}
                    onChange={handleSectionChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="order"
                    value={sectionForm.order}
                    onChange={handleSectionChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowSectionModal(false)
                  }
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {editingSection
                    ? "Update Section"
                    : "Create Section"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* QUESTION ASSIGNMENT MODAL */}
      {/* ================================================= */}
      {showQuestionModal && selectedSection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-xl">

            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Questions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Section:{" "}
                  <span className="font-medium text-blue-600">
                    {selectedSection.name ||
                      selectedSection.title}
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  setShowQuestionModal(false)
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>

            </div>

            {/* ================= FILTERS ================= */}
            <div className="p-4 border-b bg-gray-50">

              <div className="flex items-center gap-2 mb-3">
                <Filter size={17} />

                <span className="font-medium text-gray-700">
                  Question Filters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

                {/* Search */}
                <div className="relative">

                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search question..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 bg-white outline-none"
                  />

                </div>

                {/* Type */}
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white outline-none"
                >
                  <option value="">All Types</option>

                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Topic */}
                <select
                  value={topicFilter}
                  onChange={(e) =>
                    setTopicFilter(e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white outline-none"
                >
                  <option value="">All Topics</option>

                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>

                {/* Difficulty */}
                <select
                  value={difficultyFilter}
                  onChange={(e) =>
                    setDifficultyFilter(e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white outline-none"
                >
                  <option value="">
                    All Difficulty
                  </option>

                  {difficultyOptions.map(
                    (difficulty) => (
                      <option
                        key={difficulty}
                        value={difficulty}
                      >
                        {difficulty}
                      </option>
                    )
                  )}
                </select>

                {/* Clear */}
                <button
                  onClick={clearFilters}
                  className="border border-gray-300 bg-white hover:bg-gray-100 rounded-lg px-3 py-2.5"
                >
                  Clear Filters
                </button>

              </div>

              {/* Random Selection */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div className="flex items-center gap-2">

                  <input
                    type="number"
                    min="1"
                    value={randomCount}
                    onChange={(e) =>
                      setRandomCount(e.target.value)
                    }
                    placeholder="No. of questions"
                    className="w-48 border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                  />

                  <button
                    onClick={handleRandomQuestions}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium"
                  >
                    <Shuffle size={17} />
                    Select Random
                  </button>

                </div>

                <div className="text-sm text-gray-600">
                  Available:{" "}
                  <strong>
                    {filteredQuestions.length}
                  </strong>
                  {" | "}
                  Selected:{" "}
                  <strong className="text-blue-600">
                    {selectedQuestions.length}
                  </strong>
                </div>

              </div>

            </div>

            {/* ================= QUESTION LIST ================= */}
            <div className="flex-1 overflow-y-auto p-4">

              {/* Select All */}
              <div className="flex items-center justify-between mb-3">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      filteredQuestions.length > 0 &&
                      filteredQuestions.every((question) =>
                        selectedQuestions.includes(
                          question._id
                        )
                      )
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />

                  <span className="text-sm font-medium">
                    Select All
                  </span>

                </label>

                <span className="text-sm text-gray-500">
                  {filteredQuestions.length} questions
                </span>

              </div>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No questions found
                </div>
              ) : (
                <div className="space-y-2">

                  {filteredQuestions.map(
                    (question, index) => {

                      const isSelected =
                        selectedQuestions.includes(
                          question._id
                        );

                      const assignedToOtherSection =
                        question.sectionId &&
                        String(
                          question.sectionId?._id ||
                            question.sectionId
                        ) !==
                          String(selectedSection._id);

                      return (
                        <div
                          key={question._id}
                          onClick={() =>
                            toggleQuestion(question._id)
                          }
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            {/* Checkbox */}
                            <div className="pt-1">

                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  toggleQuestion(
                                    question._id
                                  )
                                }
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                                className="w-4 h-4"
                              />

                            </div>

                            {/* Question */}
                            <div className="flex-1">

                              <div className="flex flex-wrap gap-2 mb-2">

                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  Q{index + 1}
                                </span>

                                {question.type && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {question.type}
                                  </span>
                                )}

                                {question.topic && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {question.topic}
                                  </span>
                                )}

                                {question.difficulty && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    {question.difficulty}
                                  </span>
                                )}

                                {assignedToOtherSection && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    Already Assigned
                                  </span>
                                )}

                              </div>

                              <p className="text-sm text-gray-800">
                                {question.question ||
                                  question.title ||
                                  "Question"}
                              </p>

                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>
                                  Marks:{" "}
                                  {question.marks ?? 0}
                                </span>

                                <span>
                                  Negative:{" "}
                                  {question.negativeMarks ??
                                    0}
                                </span>
                              </div>

                            </div>

                            {/* Selected Icon */}
                            {isSelected && (
                              <div className="bg-blue-600 text-white rounded-full p-1">
                                <Check size={14} />
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* ================= FOOTER ================= */}
            <div className="p-4 border-t bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div className="text-sm text-gray-600">
                <strong className="text-blue-600">
                  {selectedQuestions.length}
                </strong>{" "}
                questions selected
              </div>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setShowQuestionModal(false)
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveQuestions}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Save Questions
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Section;
