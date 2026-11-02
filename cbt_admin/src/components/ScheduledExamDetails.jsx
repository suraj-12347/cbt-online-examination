
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getScheduledExamById,
  getScheduledStudentsByExam,
  updateScheduledExam,
  cancelScheduledExam,
} from "../services/scheduledExamApi";

// =====================================================
// START: Helper Functions
// =====================================================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const formatTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Convert date to YYYY-MM-DD according to India timezone
const getIndiaDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

// Convert date to HH:mm according to India timezone
const getIndiaTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(date));
};

// =====================================================
// END: Helper Functions
// =====================================================

const ScheduledExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scheduledExam, setScheduledExam] = useState(null);

  // All students assigned to this exam
  const [assignedStudents, setAssignedStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [formData, setFormData] = useState({
    examDate: "",
    startTime: "",
    endTime: "",
    invigilatorId: "",
    notes: "",
  });

  // =====================================================
  // START: Fetch Details
  // =====================================================

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const response = await getScheduledExamById(id);

      const data = response?.data?.data || response?.data;

      if (!data) {
        setScheduledExam(null);
        return;
      }

      setScheduledExam(data);

      // -------------------------------------------------
      // Set edit form data
      // -------------------------------------------------

      setFormData({
        examDate: data.startTime
          ? getIndiaDate(data.startTime)
          : "",

        startTime: data.startTime
          ? getIndiaTime(data.startTime)
          : "",

        endTime: data.endTime
          ? getIndiaTime(data.endTime)
          : "",

        invigilatorId:
          typeof data.invigilatorId === "object"
            ? data.invigilatorId?._id || ""
            : data.invigilatorId || "",

        notes: data.notes || "",
      });

      // -------------------------------------------------
      // Fetch all students assigned to same exam
      // -------------------------------------------------

      const examId =
        typeof data.examId === "object"
          ? data.examId?._id
          : data.examId;

      if (examId) {
        await fetchAssignedStudents(examId);
      }
    } catch (error) {
      console.error("Get Scheduled Exam Details Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch scheduled exam details"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // END: Fetch Details
  // =====================================================

  // =====================================================
  // START: Fetch Assigned Students
  // =====================================================

  const fetchAssignedStudents = async (examId) => {
    try {
      setStudentsLoading(true);

      const response = await getScheduledStudentsByExam(examId);

      const data =
        response?.data?.data ||
        response?.data?.students ||
        response?.data ||
        [];

      const students = Array.isArray(data) ? data : [];

      setAssignedStudents(students);
    } catch (error) {
      console.error("Get Assigned Students Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch assigned students"
      );

      setAssignedStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // =====================================================
  // END: Fetch Assigned Students
  // =====================================================

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // =====================================================
  // START: Form Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // END: Form Change
  // =====================================================

  // =====================================================
  // START: Save Changes
  // =====================================================

  const handleSave = async () => {
    if (!scheduledExam) return;

    // Only scheduled exam can be edited
    if (scheduledExam.status !== "scheduled") {
      toast.error("This exam can no longer be edited");
      return;
    }

    if (!formData.examDate) {
      toast.error("Exam date is required");
      return;
    }

    if (!formData.startTime) {
      toast.error("Start time is required");
      return;
    }

    if (!formData.endTime) {
      toast.error("End time is required");
      return;
    }

    if (!formData.invigilatorId) {
      toast.error("Invigilator is required");
      return;
    }

    const start = new Date(
      `${formData.examDate}T${formData.startTime}:00+05:30`
    );

    const end = new Date(
      `${formData.examDate}T${formData.endTime}:00+05:30`
    );

    if (start >= end) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      setSaving(true);

      await updateScheduledExam(id, {
        invigilatorId: formData.invigilatorId,

        examDate: `${formData.examDate}T00:00:00+05:30`,

        startTime: `${formData.examDate}T${formData.startTime}:00+05:30`,

        endTime: `${formData.examDate}T${formData.endTime}:00+05:30`,

        notes: formData.notes.trim(),
      });

      toast.success("Scheduled exam updated successfully");

      setEditing(false);

      await fetchDetails();
    } catch (error) {
      console.error("Update Scheduled Exam Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update scheduled exam"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // END: Save Changes
  // =====================================================

  // =====================================================
  // START: Cancel Exam
  // =====================================================

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this scheduled exam?"
    );

    if (!confirmCancel) return;

    try {
      setCancelling(true);

      await cancelScheduledExam(id);

      toast.success("Scheduled exam cancelled successfully");

      setEditing(false);

      await fetchDetails();
    } catch (error) {
      console.error("Cancel Scheduled Exam Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to cancel scheduled exam"
      );
    } finally {
      setCancelling(false);
    }
  };

  // =====================================================
  // END: Cancel Exam
  // =====================================================

  // =====================================================
  // START: Status Badge
  // =====================================================

  const getStatusBadge = (status) => {
    if (status === "scheduled") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
          <Clock size={15} />
          Scheduled
        </span>
      );
    }

    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
          <CheckCircle2 size={15} />
          Active
        </span>
      );
    }

    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-700">
          <CheckCircle2 size={15} />
          Completed
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
          <XCircle size={15} />
          Cancelled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600">
        <AlertCircle size={15} />
        {status || "Unknown"}
      </span>
    );
  };

  // =====================================================
  // END: Status Badge
  // =====================================================

  // =====================================================
  // START: Loading
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw size={20} className="animate-spin" />
          Loading scheduled exam...
        </div>
      </div>
    );
  }

  // =====================================================
  // END: Loading
  // =====================================================

  if (!scheduledExam) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <AlertCircle
          size={40}
          className="mb-3 text-red-500"
        />

        <h2 className="text-xl font-semibold text-gray-700">
          Scheduled exam not found
        </h2>

        <button
          onClick={() => navigate("/scheduled-exams")}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Scheduled Exams
        </button>
      </div>
    );
  }

  const exam = scheduledExam.examId;
  const invigilator = scheduledExam.invigilatorId;

  const canEdit = scheduledExam.status === "scheduled";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* =====================================================
          START: Header
      ===================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/scheduled-exams")}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Scheduled Exam Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View complete scheduled exam information.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {getStatusBadge(scheduledExam.status)}

          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Edit3 size={17} />
              Edit
            </button>
          )}

          {editing && canEdit && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchDetails();
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <X size={17} />
                Cancel Edit
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          END: Header
      ===================================================== */}

      {/* =====================================================
          START: Read Only Notice
      ===================================================== */}

      {!canEdit && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="font-semibold text-blue-800">
              This scheduled exam is read-only
            </p>

            <p className="mt-1 text-sm text-blue-700">
              The exam has already been activated, completed or
              cancelled. Its schedule details cannot be edited.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          END: Read Only Notice
      ===================================================== */}

      {/* =====================================================
          START: Assigned Students
      ===================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Assigned Students
              </h2>

              <p className="text-xs text-gray-500">
                Students assigned to this exam
              </p>
            </div>
          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {studentsLoading
              ? "Loading..."
              : `${assignedStudents.length} Students`}
          </div>
        </div>

        {studentsLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <RefreshCw
              size={20}
              className="mr-2 animate-spin"
            />
            Loading assigned students...
          </div>
        ) : assignedStudents.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <Users
              size={35}
              className="mx-auto mb-3 text-gray-400"
            />

            <p className="font-medium text-gray-600">
              No assigned students found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Student
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Roll No
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Course
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Branch
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Semester
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    Attendance
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                    System
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignedStudents.map((schedule, index) => {
                  const student = schedule?.studentId;

                  return (
                    <tr
                      key={schedule?._id || index}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600">
                            {student?.image ? (
                              <img
                                src={student.image}
                                alt={student?.name || "Student"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={18} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {student?.name || "-"}
                            </p>

                            <p className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={12} />
                              {student?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-gray-700">
                        {student?.rollNo || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {student?.course || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {student?.branch || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {student?.semester || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {schedule?.attendanceStatus ===
                        "verified" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={13} />
                            Verified
                          </span>
                        ) : schedule?.attendanceStatus ===
                          "absent" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <XCircle size={13} />
                            Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <Clock size={13} />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {schedule?.allocatedSystem ||
                            "Not allocated"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          END: Assigned Students
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* =====================================================
            START: Exam Information
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Exam Information
              </h2>

              <p className="text-xs text-gray-500">
                Examination details
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400">
                Exam Title
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {exam?.title || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">
                  Duration
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {exam?.duration
                    ? `${exam.duration} minutes`
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Total Marks
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {exam?.totalMarks ?? "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Exam Status
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-gray-700">
                {exam?.status || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            END: Exam Information
        ===================================================== */}

        {/* =====================================================
            START: Invigilator Information
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Invigilator
              </h2>

              <p className="text-xs text-gray-500">
                Assigned exam invigilator
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400">
                Name
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {invigilator?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Employee ID
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {invigilator?.employeeId || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Email
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={15} />
                {invigilator?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Phone
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={15} />
                {invigilator?.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Status
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-green-600">
                {invigilator?.status || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            END: Invigilator Information
        ===================================================== */}

        {/* =====================================================
            START: Schedule Information
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Clock size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Schedule Information
              </h2>

              <p className="text-xs text-gray-500">
                Exam date and timing
              </p>
            </div>
          </div>

          {editing && canEdit ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Exam Date
                </label>

                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Time
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Exam Date
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {formatDate(scheduledExam.examDate)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Start Time
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {formatTime(scheduledExam.startTime)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  End Time
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {formatTime(scheduledExam.endTime)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            END: Schedule Information
        ===================================================== */}

        {/* =====================================================
            START: Attendance & System
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
              <Monitor size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Exam Allocation
              </h2>

              <p className="text-xs text-gray-500">
                Attendance and system
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400">
                Current Student Attendance
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold capitalize text-gray-700">
                {scheduledExam.attendanceStatus ===
                "verified" ? (
                  <>
                    <CheckCircle2
                      size={16}
                      className="text-green-600"
                    />
                    Verified
                  </>
                ) : scheduledExam.attendanceStatus ===
                  "absent" ? (
                  <>
                    <XCircle
                      size={16}
                      className="text-red-600"
                    />
                    Absent
                  </>
                ) : (
                  <>
                    <Clock
                      size={16}
                      className="text-amber-600"
                    />
                    Pending
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Allocated System
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {scheduledExam.allocatedSystem ||
                  "Not allocated"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                System Allocated At
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {formatDateTime(
                  scheduledExam.allocatedAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Access Granted
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  scheduledExam.accessGranted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {scheduledExam.accessGranted
                  ? "Yes"
                  : "No"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            END: Attendance & System
        ===================================================== */}

        {/* =====================================================
            START: Notes
        ===================================================== */}

        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">
            Notes
          </h2>

          {editing && canEdit ? (
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Enter notes..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              {scheduledExam.notes ||
                "No notes added."}
            </div>
          )}
        </div>

        {/* =====================================================
            END: Notes
        ===================================================== */}

        {/* =====================================================
            START: Metadata
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-800">
            Schedule Metadata
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400">
                Schedule ID
              </p>

              <p className="mt-1 break-all text-xs font-medium text-gray-600">
                {scheduledExam._id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Created At
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {formatDateTime(
                  scheduledExam.createdAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Last Updated
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {formatDateTime(
                  scheduledExam.updatedAt
                )}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            END: Metadata
        ===================================================== */}
      </div>

      {/* =====================================================
          START: Bottom Actions
      ===================================================== */}

      {canEdit && !editing && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            {cancelling ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : (
              <XCircle size={17} />
            )}

            {cancelling
              ? "Cancelling..."
              : "Cancel Scheduled Exam"}
          </button>
        </div>
      )}

      {/* =====================================================
          END: Bottom Actions
      ===================================================== */}
    </div>
  );
};

export default ScheduledExamDetails;
