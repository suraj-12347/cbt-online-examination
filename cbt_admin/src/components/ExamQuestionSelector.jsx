
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Shuffle,
  Check,
  Plus,
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getQuestions,
  createQuestion,
} from "../services/questionApi";

const AllTopic = [
  // Numerical Ability
  "Percentage",
  "Profit and Loss",
  "Ratio and Proportion",
  "Average",
  "Time and Work",
  "Time Speed and Distance",
  "Simple Interest",
  "Compound Interest",
  "Number System",
  "HCF and LCM",
  "Probability",
  "Permutation and Combination",
  "Algebra",
  "Geometry",
  "Data Interpretation",

  // Verbal Ability
  "Reading Comprehension",
  "Grammar",
  "Vocabulary",
  "Synonyms",
  "Antonyms",
  "Sentence Correction",
  "Fill in the Blanks",
  "Para Jumbles",
  "Error Detection",

  // Reasoning Ability
  "Number Series",
  "Alphabet Series",
  "Coding Decoding",
  "Blood Relations",
  "Direction Sense",
  "Syllogism",
  "Analogy",
  "Classification",
  "Seating Arrangement",
  "Logical Reasoning",
  "Statement and Conclusion",
  "Statement and Assumption",

  // Programming Logic
  "C Programming",
  "C++ Programming",
  "Java",
  "Python",
  "Data Structures",
  "Algorithms",
  "OOPs",
  "DBMS",
  "Operating System",
  "Computer Networks",
  "Programming Output",

  // Advanced Coding
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Recursion",
  "Searching",
  "Sorting",
];
const ExamQuestionSelector = ({
  selectedSections = [],
  onBack,
  onSubmit,
  submitting = false,
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [activeSectionId, setActiveSectionId] =
    useState(
      selectedSections?.[0]?.sectionId || ""
    );

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState(() => {
      const initial = {};

      selectedSections.forEach((section) => {
        initial[section.sectionId] =
          section.questionIds || [];
      });

      return initial;
    });

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    topic: "",
    difficulty: "",
  });

  const [randomCount, setRandomCount] = useState("");

  const [showAddQuestion, setShowAddQuestion] =
    useState(false);

  const [addingQuestion, setAddingQuestion] =
    useState(false);

  const [questionForm, setQuestionForm] =
    useState({
      question: "",
      type: "mcq",
      topic: "",
      difficulty: "medium",
      options: [
        { text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
      ],
      correctAnswer: "",
      marks: 1,
      negativeMarks: 0,
      order: 1,
      questionImage: null,
    });


  // START: Load Questions
  const loadQuestions = async () => {
    try {
      setLoading(true);

      const response = await getQuestions();

      const data =
        response?.data?.questions || [];

      setQuestions(data);
    } catch (error) {
      console.error("GET QUESTIONS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load questions"
      );
    } finally {
      setLoading(false);
    }
  };
  // END: Load Questions


  useEffect(() => {
    loadQuestions();
  }, []);


  // START: Active Section
  const activeSection = selectedSections.find(
    (section) =>
      String(section.sectionId) ===
      String(activeSectionId)
  );
  // END: Active Section


  // START: Questions Of Active Section
  const sectionQuestions = useMemo(() => {
    if (!activeSectionId) {
      return [];
    }

    return questions.filter((question) => {
      const questionSectionId =
        question.sectionId?._id ||
        question.sectionId;

      return (
        String(questionSectionId) ===
        String(activeSectionId)
      );
    });
  }, [questions, activeSectionId]);
  // END: Questions Of Active Section


  // START: Filter Options
  const questionTypes = useMemo(() => {
    return [
      ...new Set(
        sectionQuestions
          .map((question) => question.type)
          .filter(Boolean)
      ),
    ];
  }, [sectionQuestions]);


  const topics = useMemo(() => {
    return [
      ...new Set(
        sectionQuestions
          .map((question) => question.topic)
          .filter(Boolean)
      ),
    ];
  }, [sectionQuestions]);


  const difficulties = useMemo(() => {
    return [
      ...new Set(
        sectionQuestions
          .map((question) => question.difficulty)
          .filter(Boolean)
      ),
    ];
  }, [sectionQuestions]);
  // END: Filter Options


  // START: Filter Questions
  const filteredQuestions = useMemo(() => {
    return sectionQuestions.filter(
      (question) => {
        const search =
          filters.search.trim().toLowerCase();

        const questionText = (
          question.question || ""
        ).toLowerCase();

        const matchesSearch =
          !search ||
          questionText.includes(search);

        const matchesType =
          !filters.type ||
          question.type === filters.type;

        const matchesTopic =
          !filters.topic ||
          question.topic === filters.topic;

        const matchesDifficulty =
          !filters.difficulty ||
          question.difficulty ===
            filters.difficulty;

        return (
          matchesSearch &&
          matchesType &&
          matchesTopic &&
          matchesDifficulty
        );
      }
    );
  }, [
    sectionQuestions,
    filters,
  ]);
  // END: Filter Questions


  // START: Current Selected IDs
  const currentSelectedIds =
    selectedQuestionIds[activeSectionId] || [];
  // END: Current Selected IDs


  // START: Toggle Question
  const toggleQuestion = (questionId) => {
    setSelectedQuestionIds((prev) => {
      const current =
        prev[activeSectionId] || [];

      const exists = current.some(
        (id) => String(id) === String(questionId)
      );

      return {
        ...prev,
        [activeSectionId]: exists
          ? current.filter(
              (id) =>
                String(id) !==
                String(questionId)
            )
          : [...current, questionId],
      };
    });
  };
  // END: Toggle Question


  // START: Select All
  const handleSelectAll = () => {
    const filteredIds =
      filteredQuestions.map(
        (question) => question._id
      );

    setSelectedQuestionIds((prev) => {
      const current =
        prev[activeSectionId] || [];

      const allSelected =
        filteredIds.length > 0 &&
        filteredIds.every((id) =>
          current.some(
            (selectedId) =>
              String(selectedId) ===
              String(id)
          )
        );

      if (allSelected) {
        return {
          ...prev,
          [activeSectionId]: current.filter(
            (id) =>
              !filteredIds.some(
                (filteredId) =>
                  String(filteredId) ===
                  String(id)
              )
          ),
        };
      }

      const merged = [
        ...current,
        ...filteredIds.filter(
          (id) =>
            !current.some(
              (currentId) =>
                String(currentId) ===
                String(id)
            )
        ),
      ];

      return {
        ...prev,
        [activeSectionId]: merged,
      };
    });
  };
  // END: Select All


  // START: Random Questions
  const handleRandomQuestions = () => {
    const count = Number(randomCount);

    if (!count || count < 1) {
      toast.error(
        "Enter a valid number of questions"
      );
      return;
    }

    if (count > filteredQuestions.length) {
      toast.error(
        `Only ${filteredQuestions.length} questions are available`
      );
      return;
    }

    const shuffled = [...filteredQuestions].sort(
      () => Math.random() - 0.5
    );

    const randomQuestions = shuffled
      .slice(0, count)
      .map((question) => question._id);

    setSelectedQuestionIds((prev) => {
      const current =
        prev[activeSectionId] || [];

      const merged = [
        ...current,
        ...randomQuestions.filter(
          (id) =>
            !current.some(
              (currentId) =>
                String(currentId) ===
                String(id)
            )
        ),
      ];

      return {
        ...prev,
        [activeSectionId]: merged,
      };
    });

    setRandomCount("");

    toast.success(
      `${count} questions selected randomly`
    );
  };
  // END: Random Questions


  // START: Clear Filters
  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      topic: "",
      difficulty: "",
    });
  };
  // END: Clear Filters


  // START: Question Form Change
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;

    setQuestionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // END: Question Form Change


  // START: Option Change
  const handleOptionChange = (index, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                text: value,
              }
            : option
      ),
    }));
  };
  // END: Option Change


  // START: Add New Option
  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { text: "" },
      ],
    }));
  };
  // END: Add New Option


  // START: Remove Option
  const removeOption = (index) => {
    if (questionForm.options.length <= 2) {
      toast.error(
        "At least 2 options are required"
      );
      return;
    }

    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      ),
    }));
  };
  // END: Remove Option


  // START: Add Question
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!activeSectionId) {
      toast.error("Please select a section");
      return;
    }

    if (!questionForm.question.trim()) {
      toast.error("Question is required");
      return;
    }

    if (
      questionForm.type === "mcq" &&
      questionForm.options.some(
        (option) => !option.text.trim()
      )
    ) {
      toast.error(
        "Please fill all options"
      );
      return;
    }

    if (
      questionForm.type === "mcq" &&
      questionForm.correctAnswer === ""
    ) {
      toast.error(
        "Please select correct answer"
      );
      return;
    }

    try {
      setAddingQuestion(true);

      const formData = new FormData();

      formData.append(
        "sectionId",
        activeSectionId
      );

      formData.append(
        "question",
        questionForm.question.trim()
      );

      formData.append(
        "type",
        questionForm.type
      );

      formData.append(
        "topic",
        questionForm.topic.trim()
      );

      formData.append(
        "difficulty",
        questionForm.difficulty
      );

      formData.append(
        "options",
        JSON.stringify(
          questionForm.options.map(
            (option) => ({
              text: option.text,
            })
          )
        )
      );

      formData.append(
        "correctAnswer",
        questionForm.correctAnswer
      );

      formData.append(
        "marks",
        Number(questionForm.marks)
      );

      formData.append(
        "negativeMarks",
        Number(questionForm.negativeMarks)
      );

      formData.append(
        "order",
        Number(questionForm.order)
      );

      if (questionForm.questionImage) {
        formData.append(
          "questionImage",
          questionForm.questionImage
        );
      }

      const response =
        await createQuestion(formData);

      const newQuestion =
        response?.data?.question;

      if (newQuestion) {
        setQuestions((prev) => [
          ...prev,
          newQuestion,
        ]);

        setSelectedQuestionIds((prev) => ({
          ...prev,
          [activeSectionId]: [
            ...(prev[activeSectionId] || []),
            newQuestion._id,
          ],
        }));
      }

      setQuestionForm({
        question: "",
        type: "mcq",
        topic: "",
        difficulty: "medium",
        options: [
          { text: "" },
          { text: "" },
          { text: "" },
          { text: "" },
        ],
        correctAnswer: "",
        marks: 1,
        negativeMarks: 0,
        order: sectionQuestions.length + 2,
        questionImage: null,
      });

      setShowAddQuestion(false);

      toast.success(
        "Question added successfully"
      );
    } catch (error) {
      console.error(
        "CREATE QUESTION ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to add question"
      );
    } finally {
      setAddingQuestion(false);
    }
  };
  // END: Add Question


  // START: Final Submit
  const handleSubmit = () => {
    if (selectedSections.length === 0) {
      toast.error(
        "Please select at least one section"
      );
      return;
    }

    const examSections =
      selectedSections.map((section) => ({
        sectionId: section.sectionId,
        questionIds:
          selectedQuestionIds[
            section.sectionId
          ] || [],
      }));

    const emptySection = examSections.find(
      (section) =>
        section.questionIds.length === 0
    );

    if (emptySection) {
      toast.error(
        "Every selected section must have at least one question"
      );
      return;
    }

    onSubmit(examSections);
  };
  // END: Final Submit


  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
        Loading questions...
      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* Section Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">

        <div className="flex items-center gap-3 overflow-x-auto">

          {selectedSections.map(
            (section, index) => {
              const sectionData =
                section.section;

              const selectedCount =
                (
                  selectedQuestionIds[
                    section.sectionId
                  ] || []
                ).length;

              const isActive =
                String(activeSectionId) ===
                String(section.sectionId);

              return (
                <button
                  key={section.sectionId}
                  type="button"
                  onClick={() =>
                    setActiveSectionId(
                      section.sectionId
                    )
                  }
                  className={`min-w-[190px] text-left p-4 rounded-xl border transition
                    ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-400">
                      Section {index + 1}
                    </span>

                    {selectedCount > 0 && (
                      <span className="text-xs font-medium text-blue-600">
                        {selectedCount} selected
                      </span>
                    )}

                  </div>

                  <h3 className="font-semibold text-gray-800 mt-1">
                    {sectionData?.name}
                  </h3>

                  <p className="text-sm text-blue-600 mt-1">
                    {sectionData?.shortName}
                  </p>

                </button>
              );
            }
          )}

        </div>
      </div>


      {/* Current Section */}
      {activeSection && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {activeSection.section?.name}
                </h2>

                <div className="flex items-center gap-3 mt-1">

                  <span className="text-sm text-blue-600 font-medium">
                    {activeSection.section?.shortName}
                  </span>

                  <span className="text-sm text-gray-400">
                    |
                  </span>

                  <span className="text-sm text-gray-500">
                    Available:{" "}
                    {sectionQuestions.length}
                  </span>

                  <span className="text-sm text-gray-400">
                    |
                  </span>

                  <span className="text-sm text-green-600 font-medium">
                    Selected:{" "}
                    {currentSelectedIds.length}
                  </span>

                </div>
              </div>


              <button
                type="button"
                onClick={() =>
                  setShowAddQuestion(true)
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
              >
                <Plus size={17} />
                Add New Question
              </button>

            </div>
          </div>


          {/* Filters */}
          <div className="p-6 border-b border-gray-200">

            <div className="flex items-center gap-2 mb-4">
              <Filter
                size={17}
                className="text-gray-500"
              />

              <h3 className="font-medium text-gray-700">
                Question Filters
              </h3>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Search */}
              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  placeholder="Search question..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
                />

              </div>


              {/* Type */}
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:border-blue-500"
              >
                <option value="">
                  All Types
                </option>

                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>


              {/* Topic */}
              <select
                value={filters.topic}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    topic: e.target.value,
                  }))
                }
                className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:border-blue-500"
              >
                <option value="">
                  All Topics
                </option>

                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>


              {/* Difficulty */}
              <select
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
                className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:border-blue-500"
              >
                <option value="">
                  All Difficulties
                </option>

                {difficulties.map(
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

            </div>


            {/* Filter Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                Select / Unselect All
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
              >
                Clear Filters
              </button>


              <div className="flex items-center gap-2 ml-auto">

                <input
                  type="number"
                  min="1"
                  max={filteredQuestions.length}
                  value={randomCount}
                  onChange={(e) =>
                    setRandomCount(
                      e.target.value
                    )
                  }
                  placeholder="No. of questions"
                  className="w-40 px-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm"
                />

                <button
                  type="button"
                  onClick={
                    handleRandomQuestions
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  <Shuffle size={16} />
                  Random Select
                </button>

              </div>

            </div>

          </div>


          {/* Question List */}
          <div className="p-6">

            <div className="flex items-center justify-between mb-4">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {filteredQuestions.length}
                </span>{" "}
                questions
              </p>

              <p className="text-sm text-green-600 font-medium">
                {currentSelectedIds.length} selected
              </p>

            </div>


            {filteredQuestions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">

                <Search
                  size={36}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="font-medium text-gray-600">
                  No questions found
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Try changing your filters or add a
                  new question
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {filteredQuestions.map(
                  (question, index) => {

                    const isSelected =
                      currentSelectedIds.some(
                        (id) =>
                          String(id) ===
                          String(question._id)
                      );

                    return (
                      <div
                        key={question._id}
                        onClick={() =>
                          toggleQuestion(
                            question._id
                          )
                        }
                        className={`cursor-pointer rounded-xl border p-4 transition
                          ${
                            isSelected
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                      >

                        <div className="flex gap-4">

                          {/* Checkbox */}
                          <div
                            className={`mt-1 w-6 h-6 rounded-md border flex items-center justify-center shrink-0
                              ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300 bg-white"
                              }`}
                          >
                            {isSelected && (
                              <Check
                                size={15}
                                className="text-white"
                              />
                            )}
                          </div>


                          {/* Question */}
                          <div className="flex-1 min-w-0">

                            <div className="flex flex-wrap items-center gap-2 mb-2">

                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                                Q{index + 1}
                              </span>

                              {question.type && (
                                <span className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600">
                                  {question.type}
                                </span>
                              )}

                              {question.topic && (
                                <span className="text-xs px-2 py-1 rounded-md bg-purple-50 text-purple-600">
                                  {question.topic}
                                </span>
                              )}

                              {question.difficulty && (
                                <span className="text-xs px-2 py-1 rounded-md bg-orange-50 text-orange-600">
                                  {question.difficulty}
                                </span>
                              )}

                            </div>


                            <p className="text-sm text-gray-800 leading-6">
                              {question.question}
                            </p>


                            {question.questionImage && (
                              <div className="mt-3">

                                <img
                                  src={
                                    question.questionImage
                                  }
                                  alt="Question"
                                  className="max-w-[220px] max-h-[140px] object-contain rounded-lg border"
                                />

                              </div>
                            )}

                          </div>


                          {/* Marks */}
                          <div className="text-right shrink-0">

                            <p className="text-sm font-semibold text-gray-700">
                              +{question.marks || 0}
                            </p>

                            {question.negativeMarks !==
                              undefined && (
                              <p className="text-xs text-red-500 mt-1">
                                -
                                {
                                  question.negativeMarks
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>
      )}


      {/* Bottom Navigation */}
      <div className="flex items-center justify-between">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl font-medium"
        >
          <Save size={18} />

          {submitting
            ? "Creating Exam..."
            : "Create Exam"}
        </button>

      </div>


      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Add New Question
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Adding to{" "}
                  <span className="font-medium text-blue-600">
                    {activeSection?.section?.name}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddQuestion(false)
                }
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={19} />
              </button>

            </div>


            {/* Modal Form */}
            <form
              onSubmit={handleAddQuestion}
              className="p-6 space-y-5"
            >

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>

                <textarea
                  name="question"
                  value={questionForm.question}
                  onChange={
                    handleQuestionFormChange
                  }
                  rows={4}
                  placeholder="Enter question"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-blue-500"
                />
              </div>


              {/* Type + Topic + Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>

                  <select
                    name="type"
                    value={questionForm.type}
                    onChange={
                      handleQuestionFormChange
                    }
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    <option value="mcq">
                      MCQ
                    </option>

                    <option value="subjective">
                      Subjective
                    </option>

                    <option value="coding">
                      Coding
                    </option>
                  </select>
                </div>


              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Topic
  </label>

  <select
    name="topic"
    value={questionForm.topic}
    onChange={handleQuestionFormChange}
    className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white outline-none focus:border-blue-500"
  >
    <option value="">
      Select Topic
    </option>

    {AllTopic.map((topic) => (
      <option key={topic} value={topic}>
        {topic}
      </option>
    ))}
  </select>
</div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    value={
                      questionForm.difficulty
                    }
                    onChange={
                      handleQuestionFormChange
                    }
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>
                  </select>
                </div>

              </div>


              {/* MCQ Options */}
              {questionForm.type === "mcq" && (
                <div>

                  <div className="flex items-center justify-between mb-3">

                    <label className="text-sm font-medium text-gray-700">
                      Options
                    </label>

                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                      + Add Option
                    </button>

                  </div>


                  <div className="space-y-3">

                    {questionForm.options.map(
                      (option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >

                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold">
                            {String.fromCharCode(
                              65 + index
                            )}
                          </div>

                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${
                              index + 1
                            }`}
                            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
                          />

                          {questionForm.options
                            .length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeOption(
                                  index
                                )
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X size={17} />
                            </button>
                          )}

                        </div>
                      )
                    )}

                  </div>


                  {/* Correct Answer */}
                  <div className="mt-4">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>

                    <select
                      name="correctAnswer"
                      value={
                        questionForm.correctAnswer
                      }
                      onChange={
                        handleQuestionFormChange
                      }
                      className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white outline-none"
                    >
                      <option value="">
                        Select Correct Answer
                      </option>

                      {questionForm.options.map(
                        (_, index) => (
                          <option
                            key={index}
                            value={index}
                          >
                            Option{" "}
                            {String.fromCharCode(
                              65 + index
                            )}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>
              )}


              {/* Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>

                  <input
                    type="number"
                    name="marks"
                    min="0"
                    value={questionForm.marks}
                    onChange={
                      handleQuestionFormChange
                    }
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 outline-none"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Negative Marks
                  </label>

                  <input
                    type="number"
                    name="negativeMarks"
                    min="0"
                    step="0.25"
                    value={
                      questionForm.negativeMarks
                    }
                    onChange={
                      handleQuestionFormChange
                    }
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 outline-none"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>

                  <input
                    type="number"
                    name="order"
                    min="1"
                    value={questionForm.order}
                    onChange={
                      handleQuestionFormChange
                    }
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 outline-none"
                  />
                </div>

              </div>


              {/* Question Image */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Image
                </label>

                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:bg-gray-50">

                  <ImageIcon
                    size={20}
                    className="text-gray-400"
                  />

                  <span className="text-sm text-gray-500">
                    {questionForm.questionImage
                      ? questionForm.questionImage
                          .name
                      : "Choose question image"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setQuestionForm(
                        (prev) => ({
                          ...prev,
                          questionImage:
                            e.target.files?.[0] ||
                            null,
                        })
                      )
                    }
                  />

                </label>

              </div>


              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddQuestion(false)
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium"
                >
                  {addingQuestion
                    ? "Adding..."
                    : "Add Question"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default ExamQuestionSelector;

