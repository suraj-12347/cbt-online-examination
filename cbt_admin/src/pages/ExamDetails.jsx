

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, X, Plus } from "lucide-react";
import { toast } from "react-toastify";

import { getExamById, updateExam } from "../services/examApi";
import {
  getSectionsByExam,
  createSection,
} from "../services/sectionApi";

import SectionDetails from "../components/examDetails/SectionDetails";

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingSection, setAddingSection] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    totalMarks: "",
    negativeMarking: true,
    status: "draft",
  });

  // START: Load Exam
  const loadExam = async () => {
    try {
      setLoading(true);

      const examResponse = await getExamById(id);
      const sectionResponse = await getSectionsByExam(id);

      const examData =
        examResponse.data.exam || examResponse.data;

      setExam(examData);
      setSections(sectionResponse.data.sections || []);

      setForm({
        title: examData.title || "",
        description: examData.description || "",
        duration: examData.duration || "",
        totalMarks: examData.totalMarks || "",
        negativeMarking: examData.negativeMarking ?? true,
        status: examData.status || "draft",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load exam details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [id]);
  // END: Load Exam


  // START: Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // END: Input Change


  // START: Save Exam
  const handleSave = async () => {
    try {
      if (!form.title.trim()) {
        toast.error("Exam title is required");
        return;
      }

      setSaving(true);

      const response = await updateExam(id, {
        title: form.title,
        description: form.description,
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        negativeMarking: form.negativeMarking,
        status: form.status,
      });

      const updatedExam =
        response.data.exam || response.data;

      setExam(updatedExam);
      setIsEditing(false);

      toast.success("Exam updated successfully");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update exam"
      );
    } finally {
      setSaving(false);
    }
  };
  // END: Save Exam


  // START: Cancel Edit
  const handleCancel = () => {
    setForm({
      title: exam.title || "",
      description: exam.description || "",
      duration: exam.duration || "",
      totalMarks: exam.totalMarks || "",
      negativeMarking: exam.negativeMarking ?? true,
      status: exam.status || "draft",
    });

    setIsEditing(false);
  };
  // END: Cancel Edit


  // START: Add Section
  const handleAddSection = async () => {
    try {
      setAddingSection(true);

      await createSection({
        examId: id,
        name: `Section ${sections.length + 1}`,
        shortName: `Section ${sections.length + 1}`,
        totalQuestions: 0,
        duration: 1,
        order: sections.length + 1,
      });

      toast.success("Section added successfully");

      await loadExam();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add section"
      );
    } finally {
      setAddingSection(false);
    }
  };
  // END: Add Section


  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading exam...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 text-center text-red-500">
        Exam not found
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* START: Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/exams")}
            className="p-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Exam Details
            </h1>

            <p className="text-sm text-gray-500">
              View and manage exam
            </p>
          </div>
        </div>
        {/* END: Header */}


        {/* START: Exam Details */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full max-w-xl px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {exam.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {exam.description || "No description"}
                  </p>
                </>
              )}
            </div>


            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit size={17} />
                Edit Exam
              </button>
            ) : (
              <div className="flex gap-2">

                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save"}
                </button>

              </div>
            )}

          </div>


          {isEditing && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}


          {/* START: Status */}
          <div className="mb-5">
            {isEditing ? (
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">
                  Completed
                </option>
              </select>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  exam.status === "active"
                    ? "bg-green-100 text-green-700"
                    : exam.status === "completed"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {exam.status}
              </span>
            )}
          </div>
          {/* END: Status */}


          {/* START: Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                Duration
              </p>

              {isEditing ? (
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full mt-2 px-2 py-1.5 border rounded-md"
                />
              ) : (
                <p className="font-semibold text-gray-800 mt-1">
                  {exam.duration} Minutes
                </p>
              )}
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                Total Marks
              </p>

              {isEditing ? (
                <input
                  type="number"
                  name="totalMarks"
                  value={form.totalMarks}
                  onChange={handleChange}
                  className="w-full mt-2 px-2 py-1.5 border rounded-md"
                />
              ) : (
                <p className="font-semibold text-gray-800 mt-1">
                  {exam.totalMarks}
                </p>
              )}
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                Sections
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {sections.length}
              </p>
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                Negative Marking
              </p>

              {isEditing ? (
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="negativeMarking"
                    checked={form.negativeMarking}
                    onChange={handleChange}
                  />
                  Enabled
                </label>
              ) : (
                <p className="font-semibold text-gray-800 mt-1">
                  {exam.negativeMarking
                    ? "Enabled"
                    : "Disabled"}
                </p>
              )}
            </div>

          </div>
          {/* END: Stats */}

        </div>
        {/* END: Exam Details */}


        {/* START: Sections */}
        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold text-gray-800">
            Sections
          </h2>

          <button
            onClick={handleAddSection}
            disabled={addingSection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={17} />

            {addingSection
              ? "Adding..."
              : "Add New Section"}
          </button>

        </div>


        {sections.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            No sections found.
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionDetails
              key={section._id}
              section={section}
              sectionNumber={index + 1}
              onDeleted={loadExam}
            />
          ))
        )}
        {/* END: Sections */}

      </div>
    </div>
  );
}

