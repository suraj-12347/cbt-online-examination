
import { useEffect, useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getExams,
  updateExam,
  deleteExam,
} from "../services/examApi";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    totalMarks: "",
    negativeMarking: true,
    status: "draft",
  });

  // =========================
  // Get Exams
  // =========================
  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data.exams || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch exams"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // =========================
  // Open Edit Modal
  // =========================
  const openEditModal = (exam) => {
    setEditingExam(exam);

    setFormData({
      title: exam.title || "",
      description: exam.description || "",
      duration: exam.duration || "",
      totalMarks: exam.totalMarks || "",
      negativeMarking: exam.negativeMarking ?? true,
      status: exam.status || "draft",
    });

    setShowModal(true);
  };

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Update Exam
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
      };

      const response = await updateExam(
        editingExam._id,
        data
      );

      setExams((prev) =>
        prev.map((exam) =>
          exam._id === editingExam._id
            ? response.data.exam
            : exam
        )
      );

      setShowModal(false);

      toast.success("Exam updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update exam"
      );
    }
  };

  // =========================
  // Delete Exam
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) return;

    try {
      await deleteExam(id);

      setExams((prev) =>
        prev.filter((exam) => exam._id !== id)
      );

      toast.success("Exam deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete exam"
      );
    }
  };

  return (
    <div className="p-6">

      {/* =========================
          Header
      ========================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Exams
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create and manage examinations
          </p>
        </div>

        <button
          onClick={() => navigate("/exams/create")}
          className="flex items-center gap-2 px-4 py-2
                     bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition"
        >
          <span className="text-lg">+</span>
          Create Exam
        </button>
      </div>

      {/* =========================
          Table
      ========================= */}
      <div className="bg-white rounded-xl border overflow-hidden">

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading exams...
          </div>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No exams found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4">
                    Exam
                  </th>

                  <th className="text-left px-6 py-4">
                    Duration
                  </th>

                  <th className="text-left px-6 py-4">
                    Total Marks
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                  <th className="text-right px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="border-b last:border-0
                               hover:bg-gray-50"
                  >
                    {/* Exam */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {exam.title}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {exam.description ||
                          "No description"}
                      </p>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 text-gray-600">
                      {exam.duration} min
                    </td>

                    {/* Marks */}
                    <td className="px-6 py-4 text-gray-600">
                      {exam.totalMarks}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full
                          text-xs font-medium
                          ${
                            exam.status === "active"
                              ? "bg-green-100 text-green-700"
                              : exam.status === "completed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {exam.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">

                        {/* view */}
                        <button
  onClick={() => navigate(`/exams/${exam._id}`)}
  className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
>
  View
</button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            handleDelete(exam._id)
                          }
                          className="p-2 rounded-lg
                                     text-red-600
                                     hover:bg-red-50"
                          title="Delete Exam"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* =========================
          Edit Modal
      ========================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center
                     justify-center bg-black/40 p-4"
        >
          <div
            className="w-full max-w-lg bg-white
                       rounded-xl shadow-xl"
          >

            {/* Modal Header */}
            <div
              className="flex items-center justify-between
                         px-6 py-4 border-b"
            >
              <div>
                <h2
                  className="text-lg font-semibold
                             text-gray-800"
                >
                  Edit Exam
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Update exam details
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >

              {/* Title */}
              <div>
                <label
                  className="block text-sm
                             font-medium text-gray-700 mb-1"
                >
                  Exam Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter exam title"
                  required
                  className="w-full px-3 py-2
                             border rounded-lg outline-none
                             focus:ring-2
                             focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm
                             font-medium text-gray-700 mb-1"
                >
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full px-3 py-2
                             border rounded-lg outline-none
                             focus:ring-2
                             focus:ring-blue-500"
                />
              </div>

              {/* Duration + Marks */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label
                    className="block text-sm
                               font-medium text-gray-700 mb-1"
                  >
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2
                               border rounded-lg outline-none
                               focus:ring-2
                               focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm
                               font-medium text-gray-700 mb-1"
                  >
                    Total Marks
                  </label>

                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2
                               border rounded-lg outline-none
                               focus:ring-2
                               focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Status */}
              <div>
                <label
                  className="block text-sm
                             font-medium text-gray-700 mb-1"
                >
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2
                             border rounded-lg outline-none
                             focus:ring-2
                             focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              {/* Negative Marking */}
              <label
                className="flex items-center gap-3
                           cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                  className="w-4 h-4"
                />

                <span className="text-sm text-gray-700">
                  Enable Negative Marking
                </span>
              </label>

              {/* Buttons */}
              <div
                className="flex justify-end gap-3 pt-4"
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg
                             border border-gray-300
                             text-gray-700
                             hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg
                             bg-blue-600 text-white
                             hover:bg-blue-700"
                >
                  Update Exam
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

