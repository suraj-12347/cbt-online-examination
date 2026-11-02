
import { useEffect, useState } from "react";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  updateSection,
  deleteSection,
} from "../../services/sectionApi";

import {
  getQuestionsBySection,
  createQuestion,
} from "../../services/questionApi";

import QuestionDetails from "./QuestionDetails";

export default function SectionDetails({
  section,
  sectionNumber,
  onDeleted,
}) {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const [form, setForm] = useState({
    name: section.name || "",
    shortName: section.shortName || "",
    duration: section.duration || 1,
  });

  // START: Load Questions
  const loadQuestions = async () => {
    try {
      const response = await getQuestionsBySection(
        section._id
      );

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load questions"
      );
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [section._id]);
  // END: Load Questions


  // START: Handle Change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  // END: Handle Change


  // START: Update Section
 
// START: Update Section
const handleSave = async () => {
  try {
    if (!form.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    if (!form.shortName.trim()) {
      toast.error("Short name is required");
      return;
    }

    const sectionData = {
      // Keep section linked with the same exam
      examId:
        section.examId?._id ||
        section.examId ||
        null,

      name: form.name.trim(),
      shortName: form.shortName.trim(),
      duration: Number(form.duration),
      totalQuestions: questions.length,
    };

    await updateSection(
      section._id,
      sectionData
    );

    setEditing(false);

    toast.success("Section updated successfully");

    if (onDeleted) {
      await onDeleted();
    }
  } catch (error) {
    console.error("UPDATE SECTION ERROR:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to update section"
    );
  }
};
// END: Update Section




  // START: Add Question

// START: Add Question
const handleAddQuestion = async () => {
  try {
    setAddingQuestion(true);

    const formData = new FormData();

    // Exam ID is optional for question
    const examId =
      section.examId?._id ||
      section.examId;

    if (examId) {
      formData.append("examId", examId);
    }

    // Section is the main relation
    formData.append(
      "sectionId",
      section._id
    );

    formData.append(
      "question",
      "New Question"
    );

    formData.append(
      "type",
      "mcq"
    );

    formData.append(
      "options",
      JSON.stringify([
        { text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
      ])
    );

    formData.append(
      "correctAnswer",
      "0"
    );

    formData.append(
      "marks",
      "1"
    );

    formData.append(
      "negativeMarks",
      "0"
    );

    formData.append(
      "order",
      String(questions.length + 1)
    );

    await createQuestion(formData);

    toast.success(
      "Question added successfully"
    );

    await loadQuestions();
  } catch (error) {
    console.error(
      "ADD QUESTION ERROR:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to add question"
    );
  } finally {
    setAddingQuestion(false);
  }
};
// END: Add Question


  // END: Add Question


  // START: Delete Section
  const handleDeleteSection = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Section ${sectionNumber}?`
    );

    if (!confirmed) return;

    try {
      await deleteSection(section._id);

      toast.success("Section deleted successfully");

      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete section"
      );
    }
  };
  // END: Delete Section


  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

      {/* START: Section Header */}
      <div className="px-6 py-4 bg-[#064273] text-white flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold">
            Section {sectionNumber}: {section.name}
          </h2>

          <p className="text-sm text-blue-100 mt-1">
            {questions.length} Questions
          </p>
        </div>

        <div className="flex items-center gap-2">

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            >
              <Edit size={16} />
              Edit
            </button>
          )}

          <button
            onClick={handleDeleteSection}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>

        </div>

      </div>
      {/* END: Section Header */}


      {/* START: Section Details */}
      <div className="p-6 border-b">

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Section Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="text-sm font-medium text-gray-700">
                Short Name
              </label>

              <input
                name="shortName"
                value={form.shortName}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="text-sm font-medium text-gray-700">
                Duration
              </label>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
              />
            </div>


            <div className="md:col-span-3 flex gap-2">

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} />
                Save
              </button>

              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <X size={16} />
                Cancel
              </button>

            </div>

          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div>
              <p className="text-xs text-gray-500">
                Section Name
              </p>

              <p className="font-medium mt-1">
                {section.name}
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Short Name
              </p>

              <p className="font-medium mt-1">
                {section.shortName}
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Duration
              </p>

              <p className="font-medium mt-1">
                {section.duration} Minutes
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Questions
              </p>

              <p className="font-medium mt-1">
                {questions.length}
              </p>
            </div>

          </div>
        )}

      </div>
      {/* END: Section Details */}


      {/* START: Questions Header */}
      <div className="p-6 pb-3 flex items-center justify-between">

        <h3 className="font-semibold text-gray-800">
          Questions
        </h3>

        <button
          onClick={handleAddQuestion}
          disabled={addingQuestion}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
        >
          <Plus size={16} />

          {addingQuestion
            ? "Adding..."
            : "Add New Question"}
        </button>

      </div>
      {/* END: Questions Header */}


      {/* START: Questions */}
      <div className="px-6 pb-6 space-y-4">

        {questions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No questions found.
          </p>
        ) : (
          questions.map((question, index) => (
            <QuestionDetails
              key={question._id}
              question={question}
              questionNumber={index + 1}
              onUpdated={loadQuestions}
            />
          ))
        )}

      </div>
      {/* END: Questions */}

    </div>
  );
}
