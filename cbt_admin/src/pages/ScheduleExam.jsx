import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { getAllStudents } from "../services/studentApi";
import { getExams } from "../services/examApi";
import { getAllInvigilators } from "../services/invigilatorApi";
import { scheduleExam } from "../services/scheduledExamApi";

// =====================================================
// Schedule Exam
// Flow:
// Step 1 -> Select Students
// Step 2 -> Select Exam + Invigilator + Date + Time
// Step 3 -> Schedule
// =====================================================

const ScheduleExam = () => {
  // =====================================================
  // BASIC STATES
  // =====================================================

  const [step, setStep] = useState(1);

  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [invigilators, setInvigilators] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingInvigilators, setLoadingInvigilators] = useState(false);

  const [scheduling, setScheduling] = useState(false);

  // =====================================================
  // STUDENT FILTER STATES
  // =====================================================

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [formStatusFilter, setFormStatusFilter] = useState("");
  const [blacklistedFilter, setBlacklistedFilter] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  // =====================================================
  // SCHEDULE STATES
  // =====================================================

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedInvigilator, setSelectedInvigilator] = useState("");

  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [notes, setNotes] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  useEffect(() => {
    fetchStudents();
  }, []);

 const fetchStudents = async () => {
  try {
    setLoadingStudents(true);

    const response = await getAllStudents();

    console.log("Students API Response:", response.data);

    const data = response?.data;

    if (Array.isArray(data)) {
      setStudents(data);
    } else if (Array.isArray(data?.users)) {
      setStudents(data.users);
    } else if (Array.isArray(data?.students)) {
      setStudents(data.students);
    } else if (Array.isArray(data?.data)) {
      setStudents(data.data);
    } else {
      console.log("Student array not found:", data);
      setStudents([]);
    }
  } catch (error) {
    console.error("Fetch students error:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to fetch students"
    );

    setStudents([]);
  } finally {
    setLoadingStudents(false);
  }
};

  // =====================================================
  // FETCH EXAMS
  // =====================================================

  const fetchExams = async () => {
    try {
      setLoadingExams(true);

      const response = await getExams();

      const data = response?.data;

      if (Array.isArray(data)) {
        setExams(data);
      } else if (Array.isArray(data?.exams)) {
        setExams(data.exams);
      } else if (Array.isArray(data?.data)) {
        setExams(data.data);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error("Fetch exams error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch exams"
      );
    } finally {
      setLoadingExams(false);
    }
  };

  // =====================================================
  // FETCH INVIGILATORS
  // =====================================================

  const fetchInvigilators = async () => {
    try {
      setLoadingInvigilators(true);

      const response = await getAllInvigilators();

      const data = response?.data;

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.invigilators)) {
        list = data.invigilators;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }

      // Only active invigilators
      const activeInvigilators = list.filter(
        (item) => item?.status !== "inactive"
      );

      setInvigilators(activeInvigilators);
    } catch (error) {
      console.error("Fetch invigilators error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch invigilators"
      );
    } finally {
      setLoadingInvigilators(false);
    }
  };

  // =====================================================
  // LOAD STEP 2 DATA
  // =====================================================

  useEffect(() => {
    if (step === 2) {
      fetchExams();
      fetchInvigilators();
    }
  }, [step]);

  // =====================================================
  // UNIQUE FILTER VALUES
  // =====================================================

  const courses = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student?.course)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const branches = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student?.branch)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const semesters = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student?.semester)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        student?.name?.toLowerCase().includes(searchText) ||
        student?.email?.toLowerCase().includes(searchText) ||
        student?.rollNo?.toLowerCase().includes(searchText);

      const matchesCourse =
        !courseFilter ||
        student?.course === courseFilter;

      const matchesBranch =
        !branchFilter ||
        student?.branch === branchFilter;

      const matchesSemester =
        !semesterFilter ||
        student?.semester === semesterFilter;

      const matchesFormStatus =
        !formStatusFilter ||
        String(student?.formStatus) === formStatusFilter;

      const matchesBlacklisted =
        !blacklistedFilter ||
        String(student?.blacklisted) === blacklistedFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesSemester &&
        matchesFormStatus &&
        matchesBlacklisted
      );
    });
  }, [
    students,
    search,
    courseFilter,
    branchFilter,
    semesterFilter,
    formStatusFilter,
    blacklistedFilter,
  ]);

  // =====================================================
  // STUDENT SELECTION
  // =====================================================

  const isStudentSelected = (studentId) => {
    return selectedStudents.includes(studentId);
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      return [...prev, studentId];
    });
  };

  const selectAllVisible = () => {
    const visibleIds = filteredStudents
      .map((student) => student?._id)
      .filter(Boolean);

    setSelectedStudents((prev) => {
      const merged = new Set([...prev, ...visibleIds]);
      return [...merged];
    });
  };

  const deselectAllVisible = () => {
    const visibleIds = new Set(
      filteredStudents
        .map((student) => student?._id)
        .filter(Boolean)
    );

    setSelectedStudents((prev) =>
      prev.filter((id) => !visibleIds.has(id))
    );
  };

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudents.includes(student?._id)
    );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setBranchFilter("");
    setSemesterFilter("");
    setFormStatusFilter("");
    setBlacklistedFilter("");
  };

  // =====================================================
  // NEXT STEP
  // =====================================================

  const goToStep2 = () => {
    if (selectedStudents.length === 0) {
      toast.warning("Please select at least one student");
      return;
    }

    setStep(2);
  };

  // =====================================================
  // BACK TO STEP 1
  // =====================================================

  const goToStep1 = () => {
    if (scheduling) return;

    setStep(1);
  };

  // =====================================================
  // DATE + TIME HELPERS
  // =====================================================

  const getTodayDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // VALIDATE SCHEDULE DATA
  // =====================================================

  const validateSchedule = () => {
    if (!selectedExam) {
      toast.warning("Please select an exam");
      return false;
    }

    if (!selectedInvigilator) {
      toast.warning("Please select an invigilator");
      return false;
    }

    if (!examDate) {
      toast.warning("Please select exam date");
      return false;
    }

    if (!startTime) {
      toast.warning("Please select start time");
      return false;
    }

    if (!endTime) {
      toast.warning("Please select end time");
      return false;
    }

    const start = new Date(
      `${examDate}T${startTime}:00+05:30`
    );

    const end = new Date(
      `${examDate}T${endTime}:00+05:30`
    );

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Invalid date or time");
      return false;
    }

    if (start >= end) {
      toast.error("End time must be greater than start time");
      return false;
    }

    return true;
  };

  // =====================================================
  // SCHEDULE EXAM
  // =====================================================

  const handleScheduleExam = async () => {
    if (scheduling) return;

    if (!validateSchedule()) return;

    if (selectedStudents.length === 0) {
      toast.warning("Please select at least one student");
      return;
    }

    try {
      setScheduling(true);

      let successCount = 0;
      let failedCount = 0;

      // Backend accepts one studentId per schedule.
      // Therefore schedule each selected student separately.
     for (const studentId of selectedStudents) {
  try {
   const scheduleData = {
  examId: selectedExam,
  studentId: studentId,
  invigilatorId: selectedInvigilator,

  examDate: `${examDate}T00:00:00+05:30`,
  startTime: `${examDate}T${startTime}:00+05:30`,
  endTime: `${examDate}T${endTime}:00+05:30`,

  notes: notes.trim(),
};

    console.log("========== SCHEDULE DEBUG ==========");
    console.log("Scheduling Data:", scheduleData);
    console.log("====================================");

    await scheduleExam(scheduleData);

    successCount++;
  } catch (error) {
    console.error(
      `Schedule failed for student ${studentId}:`,
      error?.response?.data || error
    );

    console.error(
      "Backend Error Message:",
      error?.response?.data?.message
    );

    toast.error(
      error?.response?.data?.message ||
        `Failed to schedule student ${studentId}`
    );

    failedCount++;
  }
}

      // =====================================================
      // RESULT
      // =====================================================

      if (successCount > 0 && failedCount === 0) {
        toast.success(
          `${successCount} student${
            successCount > 1 ? "s" : ""
          } scheduled successfully`
        );
      } else if (successCount > 0 && failedCount > 0) {
        toast.warning(
          `${successCount} scheduled successfully, ${failedCount} failed`
        );
      } else {
        toast.error("Failed to schedule selected students");
        return;
      }

      // =====================================================
      // RESET
      // =====================================================

      setSelectedStudents([]);
      setSelectedExam("");
      setSelectedInvigilator("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setNotes("");

      setStep(1);

      // Refresh student data if required
      await fetchStudents();
    } catch (error) {
      console.error("Schedule exam error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to schedule exam"
      );
    } finally {
      setScheduling(false);
    }
  };

  // =====================================================
  // SELECTED EXAM
  // =====================================================

  const selectedExamData = exams.find(
    (exam) => exam?._id === selectedExam
  );

  const selectedInvigilatorData = invigilators.find(
    (item) => item?._id === selectedInvigilator
  );

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getExamStatus = (status) => {
    if (!status) return "Draft";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Schedule Exam
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Schedule an exam for selected students with an
                invigilator and fixed exam timing.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2">
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />

              <span className="text-sm font-medium text-blue-700">
                Admin Scheduling
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            STEP INDICATOR
        ===================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">

            {/* STEP 1 */}

            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {step > 1 ? (
                  <Check size={20} />
                ) : (
                  <Users size={20} />
                )}
              </div>

              <div className="ml-3">
                <p
                  className={`text-sm font-semibold ${
                    step >= 1
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Step 1
                </p>

                <p className="text-xs text-gray-500">
                  Select Students
                </p>
              </div>
            </div>

            {/* LINE */}

            <div
              className={`mx-4 h-1 flex-1 rounded ${
                step >= 2
                  ? "bg-blue-600"
                  : "bg-gray-200"
              }`}
            />

            {/* STEP 2 */}

            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <CalendarDays size={20} />
              </div>

              <div className="ml-3">
                <p
                  className={`text-sm font-semibold ${
                    step >= 2
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Step 2
                </p>

                <p className="text-xs text-gray-500">
                  Schedule Details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            STEP 1
        ===================================================== */}

        {step === 1 && (
          <div className="space-y-5">

            {/* STUDENT SELECTION HEADER */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={22}
                      className="text-blue-600"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Students
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Select students who will be scheduled for
                    this exam.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                  <Users
                    size={18}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-semibold text-blue-700">
                    {selectedStudents.length} Selected
                  </span>
                </div>
              </div>
            </div>

            {/* FILTERS */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Filters
                </h3>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear Filters
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                {/* SEARCH */}

                <div className="relative xl:col-span-2">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search name, email or roll no..."
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* COURSE */}

                <select
                  value={courseFilter}
                  onChange={(e) =>
                    setCourseFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Courses</option>

                  {courses.map((course) => (
                    <option
                      key={course}
                      value={course}
                    >
                      {course}
                    </option>
                  ))}
                </select>

                {/* BRANCH */}

                <select
                  value={branchFilter}
                  onChange={(e) =>
                    setBranchFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Branches</option>

                  {branches.map((branch) => (
                    <option
                      key={branch}
                      value={branch}
                    >
                      {branch}
                    </option>
                  ))}
                </select>

                {/* SEMESTER */}

                <select
                  value={semesterFilter}
                  onChange={(e) =>
                    setSemesterFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Semesters</option>

                  {semesters.map((semester) => (
                    <option
                      key={semester}
                      value={semester}
                    >
                      {semester}
                    </option>
                  ))}
                </select>

                {/* FORM STATUS */}

                <select
                  value={formStatusFilter}
                  onChange={(e) =>
                    setFormStatusFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Form Status</option>
                  <option value="true">Completed</option>
                  <option value="false">Pending</option>
                </select>

                {/* BLACKLIST */}

                <select
                  value={blacklistedFilter}
                  onChange={(e) =>
                    setBlacklistedFilter(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Blacklist</option>
                  <option value="false">Not Blacklisted</option>
                  <option value="true">Blacklisted</option>
                </select>
              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* TABLE HEADER */}

              <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Students
                  </p>

                  <p className="text-xs text-gray-500">
                    Showing {filteredStudents.length} of{" "}
                    {students.length} students
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {allVisibleSelected ? (
                    <button
                      type="button"
                      onClick={deselectAllVisible}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Deselect Visible
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Select Visible
                    </button>
                  )}
                </div>
              </div>

              {/* LOADING */}

              {loadingStudents ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    <span className="text-sm">
                      Loading students...
                    </span>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                  <Users
                    size={42}
                    className="mb-3 text-gray-300"
                  />

                  <p className="font-medium text-gray-700">
                    No students found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-5 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={() => {
                              if (allVisibleSelected) {
                                deselectAllVisible();
                              } else {
                                selectAllVisible();
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Student
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Roll No
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Course
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Branch
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Semester
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Form
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((student) => {
                        const studentId = student?._id;
                        const selected =
                          isStudentSelected(studentId);

                        return (
                          <tr
                            key={studentId}
                            onClick={() =>
                              toggleStudent(studentId)
                            }
                            className={`cursor-pointer transition ${
                              selected
                                ? "bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleStudent(studentId)
                                }
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {student?.image ? (
                                  <img
                                    src={student.image}
                                    alt={student?.name || "Student"}
                                    className="h-9 w-9 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                    {student?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "S"}
                                  </div>
                                )}

                                <div>
                                  <p className="font-medium text-gray-900">
                                    {student?.name || "N/A"}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {student?.email || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {student?.rollNo || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {student?.course || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {student?.branch || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {student?.semester || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  student?.formStatus
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {student?.formStatus
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              {student?.blacklisted ? (
                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                                  Blacklisted
                                </span>
                              ) : (
                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                  Eligible
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SELECTED COUNT */}

              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {selectedStudents.length}
                  </span>{" "}
                  student
                  {selectedStudents.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

                <button
                  type="button"
                  onClick={goToStep2}
                  disabled={selectedStudents.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 2
        ===================================================== */}

        {step === 2 && (
          <div className="space-y-5">

            {/* TOP ACTION */}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goToStep1}
                disabled={scheduling}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Back to Students
              </button>

              <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {selectedStudents.length} Student
                {selectedStudents.length !== 1
                  ? "s"
                  : ""}{" "}
                Selected
              </div>
            </div>

            {/* =================================================
                SCHEDULE FORM
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

              {/* LEFT - EXAM */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={21}
                      className="text-blue-600"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                      Exam Details
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Select the exam that will be assigned to
                    these students.
                  </p>
                </div>

                {/* LOADING EXAMS */}

                {loadingExams ? (
                  <div className="flex min-h-[180px] items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />

                      Loading exams...
                    </div>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <GraduationCap
                      size={38}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-medium text-gray-700">
                      No exams available
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Please create an exam first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exams.map((exam) => {
                      const selected =
                        selectedExam === exam?._id;

                      return (
                        <button
                          key={exam?._id}
                          type="button"
                          onClick={() =>
                            setSelectedExam(exam?._id)
                          }
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  selected
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {selected ? (
                                  <Check size={20} />
                                ) : (
                                  <GraduationCap size={20} />
                                )}
                              </div>

                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {exam?.title || "Untitled Exam"}
                                </h3>

                                {exam?.description && (
                                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                    {exam.description}
                                  </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    <Clock size={13} />
                                    {exam?.duration ?? 0} min
                                  </span>

                                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {exam?.totalMarks ?? 0} Marks
                                  </span>

                                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {getExamStatus(exam?.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT - SUMMARY */}

              <div className="space-y-5">

                {/* STUDENT SUMMARY */}

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Users
                      size={20}
                      className="text-blue-600"
                    />

                    <h3 className="font-semibold text-gray-900">
                      Students
                    </h3>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">
                      {selectedStudents.length}
                    </p>

                    <p className="mt-1 text-sm text-blue-600">
                      Students Selected
                    </p>
                  </div>
                </div>

                {/* SELECTED EXAM */}

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Selected Exam
                  </h3>

                  {selectedExamData ? (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="font-semibold text-gray-900">
                        {selectedExamData?.title}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-2 py-1 text-gray-600">
                          {selectedExamData?.duration ?? 0} min
                        </span>

                        <span className="rounded-full bg-white px-2 py-1 text-gray-600">
                          {selectedExamData?.totalMarks ?? 0} marks
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No exam selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                INVIGILATOR + DATE + TIME
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={21}
                    className="text-blue-600"
                  />

                  <h2 className="text-lg font-semibold text-gray-900">
                    Schedule Details
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Set the invigilator and exact date/time for
                  this exam.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

                {/* INVIGILATOR */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Invigilator
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <UserCheck
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      value={selectedInvigilator}
                      onChange={(e) =>
                        setSelectedInvigilator(
                          e.target.value
                        )
                      }
                      disabled={loadingInvigilators}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingInvigilators
                          ? "Loading invigilators..."
                          : "Select Invigilator"}
                      </option>

                      {invigilators.map((invigilator) => (
                        <option
                          key={invigilator?._id}
                          value={invigilator?._id}
                        >
                          {invigilator?.name || "Unknown"}{" "}
                          {invigilator?.employeeId
                            ? `(${invigilator.employeeId})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedInvigilatorData && (
                    <p className="mt-2 text-xs text-gray-500">
                      Assigned to{" "}
                      <span className="font-medium text-gray-700">
                        {selectedInvigilatorData.name}
                      </span>
                    </p>
                  )}
                </div>

                {/* DATE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Exam Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      value={examDate}
                      min={getTodayDate()}
                      onChange={(e) =>
                        setExamDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* START TIME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Start Time
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) =>
                        setStartTime(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* END TIME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    End Time
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) =>
                        setEndTime(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* NOTES */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notes
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={3}
                  placeholder="Add any instructions or notes for the invigilator..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* =================================================
                FINAL SUMMARY
            ================================================= */}

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Check
                  size={20}
                  className="text-blue-600"
                />

                <h3 className="font-semibold text-blue-900">
                  Schedule Summary
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Students
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {selectedStudents.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Exam
                  </p>

                  <p className="mt-1 truncate font-semibold text-blue-900">
                    {selectedExamData?.title ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Invigilator
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {selectedInvigilatorData?.name ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {examDate || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Time
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {startTime && endTime
                      ? `${startTime} - ${endTime}`
                      : "Not selected"}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                BOTTOM ACTIONS
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToStep1}
                disabled={scheduling}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={handleScheduleExam}
                disabled={
                  scheduling ||
                  !selectedExam ||
                  !selectedInvigilator ||
                  !examDate ||
                  !startTime ||
                  !endTime ||
                  selectedStudents.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {scheduling ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarDays size={18} />
                    Schedule Exam
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleExam;