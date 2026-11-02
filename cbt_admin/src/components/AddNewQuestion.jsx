
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

import { createQuestion } from "../services/questionApi";
import { getSections } from "../services/sectionApi";

const AddNewQuestion = () => {
  const navigate = useNavigate();

  // =====================================================
  // States
  // =====================================================

  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    sectionId: "",
    topic: "",
    question: "",
    type: "mcq",
    correctAnswer: "",
    marks: 1,
    negativeMarks: 0,
    imageAlt: "",
    order: 1,
  });

  const [questionImage, setQuestionImage] = useState(null);

  const [options, setOptions] = useState([
    {
      text: "",
      image: null,
    },
    {
      text: "",
      image: null,
    },
    {
      text: "",
      image: null,
    },
    {
      text: "",
      image: null,
    },
  ]);

  // =====================================================
  // Hardcoded Topics
  // =====================================================

  const topics = [
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

  // =====================================================
  // Fetch Sections
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);

        const sectionResponse = await getSections();

        setSections(sectionResponse.data.sections || []);
      } catch (error) {
        console.error("LOAD SECTION DATA ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load section data"
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // =====================================================
  // Input Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // Option Text Change
  // =====================================================

  const handleOptionChange = (index, value) => {
    setOptions((prev) =>
      prev.map((option, i) =>
        i === index
          ? {
              ...option,
              text: value,
            }
          : option
      )
    );
  };

  // =====================================================
  // Option Image
  // =====================================================

  const handleOptionImage = (index, file) => {
    setOptions((prev) =>
      prev.map((option, i) =>
        i === index
          ? {
              ...option,
              image: file,
            }
          : option
      )
    );
  };

  // =====================================================
  // Add Option
  // =====================================================

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        text: "",
        image: null,
      },
    ]);
  };

  // =====================================================
  // Remove Option
  // =====================================================

  const removeOption = (index) => {
    if (options.length <= 2) {
      toast.warning("At least 2 options are required");
      return;
    }

    setOptions((prev) =>
      prev.filter((_, i) => i !== index)
    );

    // If deleted option was correct answer
    const deletedOptionText = options[index]?.text;

    if (formData.correctAnswer === deletedOptionText) {
      setFormData((prev) => ({
        ...prev,
        correctAnswer: "",
      }));
    }
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.sectionId ||
      !formData.question ||
      !formData.order
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      formData.type === "mcq" &&
      !formData.correctAnswer
    ) {
      toast.error("Please select correct answer");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      // Section
      data.append("sectionId", formData.sectionId);

      // Topic
      data.append("topic", formData.topic);

      // Question
      data.append("question", formData.question);

      // Type
      data.append("type", formData.type);

      // Correct Answer
      data.append(
        "correctAnswer",
        formData.correctAnswer
      );

      // Marks
      data.append("marks", formData.marks);

      // Negative Marks
      data.append(
        "negativeMarks",
        formData.negativeMarks
      );

      // Image Alt
      data.append("imageAlt", formData.imageAlt);

      // Order
      data.append("order", formData.order);

      // Question Image
      if (questionImage) {
        data.append("questionImage", questionImage);
      }

      // Options
      const optionData = options.map((option) => ({
        text: option.text,
      }));

      data.append(
        "options",
        JSON.stringify(optionData)
      );

      // Option Images
      options.forEach((option, index) => {
        if (option.image) {
          data.append(
            `optionImage_${index}`,
            option.image
          );
        }
      });

      await createQuestion(data);

      toast.success("Question created successfully");

      navigate("/questions");
    } catch (error) {
      console.error(
        "CREATE QUESTION ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create question"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (dataLoading) {
    return (
      <div className="p-6 text-gray-500">
        Loading...
      </div>
    );
  }

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <button
          onClick={() => navigate("/questions")}
          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add New Question
          </h1>

          <p className="text-sm text-gray-500">
            Create a new question
          </p>
        </div>

      </div>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =================================================
              Main Question
          ================================================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* Question Details */}

            <div className="bg-white border border-gray-200 rounded-xl p-5">

              <h2 className="font-semibold text-gray-800 mb-5">
                Question Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Section */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section *
                  </label>

                  <select
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Section
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
                </div>

                {/* Topic */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>

                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Topic
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
                </div>

                {/* Type */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type *
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mcq">
                      MCQ
                    </option>

                    <option value="coding">
                      Coding
                    </option>
                  </select>
                </div>

              </div>

              {/* Question */}

              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>

                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter question..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Question Image */}

              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Image
                </label>

                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer hover:border-blue-400">

                  <Upload
                    size={20}
                    className="text-gray-400"
                  />

                  <span className="text-sm text-gray-500">
                    {questionImage
                      ? questionImage.name
                      : "Upload question image"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setQuestionImage(
                        e.target.files?.[0] || null
                      )
                    }
                  />

                </label>

              </div>

              {/* Alt */}

              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Alt Text
                </label>

                <input
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleChange}
                  placeholder="Describe the image"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

            {/* =================================================
                Options
            ================================================= */}

            {formData.type === "mcq" && (

              <div className="bg-white border border-gray-200 rounded-xl p-5">

                <div className="flex items-center justify-between mb-5">

                  <h2 className="font-semibold text-gray-800">
                    Options
                  </h2>

                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>

                </div>

                <div className="space-y-4">

                  {options.map((option, index) => (

                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >

                      <div className="flex items-center gap-3">

                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 font-semibold text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>

                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOption(index)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                      <label className="flex items-center gap-2 mt-3 text-sm text-gray-500 cursor-pointer">

                        <Upload size={16} />

                        {option.image
                          ? option.image.name
                          : "Upload option image"}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleOptionImage(
                              index,
                              e.target.files?.[0] ||
                                null
                            )
                          }
                        />

                      </label>

                    </div>

                  ))}

                </div>

                {/* Correct Answer */}

                <div className="mt-5">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>

                  <select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Correct Answer
                    </option>

                    {options.map((option, index) => (
                      <option
                        key={index}
                        value={option.text}
                      >
                        {String.fromCharCode(65 + index)}
                        {" - "}
                        {option.text ||
                          `Option ${index + 1}`}
                      </option>
                    ))}

                  </select>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              Right Sidebar
          ================================================= */}

          <div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">

              <h2 className="font-semibold text-gray-800 mb-5">
                Question Settings
              </h2>

              {/* Marks */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks
                </label>

                <input
                  type="number"
                  name="marks"
                  min="0"
                  step="0.25"
                  value={formData.marks}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Negative */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negative Marks
                </label>

                <input
                  type="number"
                  name="negativeMarks"
                  min="0"
                  step="0.25"
                  value={formData.negativeMarks}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Order */}

              <div className="mb-6">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Order *
                </label>

                <input
                  type="number"
                  name="order"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Buttons */}

              <div className="space-y-3">

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium"
                >
                  {loading
                    ? "Creating..."
                    : "Create Question"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/questions")
                  }
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      </form>

    </div>
  );
};

export default AddNewQuestion;
