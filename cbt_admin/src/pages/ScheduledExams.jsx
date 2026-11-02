
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  ShieldCheck,
  Eye,
  Play,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getAllScheduledExams,
  updateScheduledExamStatus,
  cancelScheduledExam,
} from "../services/scheduledExamApi";

// =====================================================
// START: Helper Functions
// =====================================================

const getDataArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.scheduledExams)) {
    return data.scheduledExams;
  }

  return [];
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
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

// =====================================================
// END: Helper Functions
// =====================================================

const ScheduledExams = () => {
  const navigate = useNavigate();

  const [scheduledExams, setScheduledExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [activatingGroup, setActivatingGroup] = useState(null);
  const [cancellingGroup, setCancellingGroup] = useState(null);

  // =====================================================
  // START: Fetch Scheduled Exams
  // =====================================================

  const fetchScheduledExams = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllScheduledExams();

      const data = getDataArray(response);

      setScheduledExams(data);
    } catch (error) {
      console.error("Get Scheduled Exams Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch scheduled exams"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduledExams();
  }, []);

  // =====================================================
  // END: Fetch Scheduled Exams
  // =====================================================

  // =====================================================
  // START: Group Scheduled Exams
  // =====================================================
  //
  // Multiple ScheduledExam documents:
  //
  // Student A -> same exam/date/time/invigilator
  // Student B -> same exam/date/time/invigilator
  // Student C -> same exam/date/time/invigilator
  //
  // Will become ONE group.
  //
  // =====================================================

  const groupedExams = useMemo(() => {
    const groups = {};

    scheduledExams.forEach((item) => {
      const examId =
        typeof item?.examId === "object"
          ? item?.examId?._id
          : item?.examId;

      const invigilatorId =
        typeof item?.invigilatorId === "object"
          ? item?.invigilatorId?._id
          : item?.invigilatorId;

      /*
       * Important:
       * Same exam can be scheduled on different dates/times.
       * So date + start + end are also included.
       */
      const start = item?.startTime
        ? new Date(item.startTime).getTime()
        : "";

      const end = item?.endTime
        ? new Date(item.endTime).getTime()
        : "";

      const groupKey = [
        examId,
        start,
        end,
        invigilatorId,
      ].join("_");

      if (!groups[groupKey]) {
        groups[groupKey] = {
          groupId: groupKey,

          examId: examId,

          exam: item?.examId,

          invigilatorId: invigilatorId,

          invigilator: item?.invigilatorId,

          examDate: item?.examDate,

          startTime: item?.startTime,

          endTime: item?.endTime,

          notes: item?.notes || "",

          students: [],

          scheduledExamIds: [],

          statuses: [],

          attendanceStatuses: [],

          allocatedSystems: [],

          createdAt: item?.createdAt,

          updatedAt: item?.updatedAt,
        };
      }

      // Add student
      groups[groupKey].students.push({
        scheduleId: item?._id,
        student: item?.studentId,
        attendanceStatus: item?.attendanceStatus,
        allocatedSystem: item?.allocatedSystem,
        accessGranted: item?.accessGranted,
      });

      // Store original ScheduledExam IDs
      groups[groupKey].scheduledExamIds.push(item?._id);

      // Store status
      groups[groupKey].statuses.push(item?.status);

      // Store attendance
      groups[groupKey].attendanceStatuses.push(
        item?.attendanceStatus
      );

      // Store allocated systems
      if (item?.allocatedSystem) {
        groups[groupKey].allocatedSystems.push(
          item.allocatedSystem
        );
      }

      // Keep latest updated time
      if (
        item?.updatedAt &&
        (!groups[groupKey].updatedAt ||
          new Date(item.updatedAt) >
            new Date(groups[groupKey].updatedAt))
      ) {
        groups[groupKey].updatedAt = item.updatedAt;
      }
    });

    return Object.values(groups);
  }, [scheduledExams]);

  // =====================================================
  // END: Group Scheduled Exams
  // =====================================================

  // =====================================================
  // START: Get Group Status
  // =====================================================

  const getGroupStatus = (group) => {
    const statuses = group?.statuses || [];

    if (statuses.length === 0) {
      return "unknown";
    }

    /*
     * If any record is active,
     * group is considered active.
     */
    if (statuses.some((status) => status === "active")) {
      return "active";
    }

    /*
     * If any record is scheduled,
     * group is considered scheduled.
     */
    if (statuses.some((status) => status === "scheduled")) {
      return "scheduled";
    }

    /*
     * If all are completed.
     */
    if (
      statuses.length > 0 &&
      statuses.every((status) => status === "completed")
    ) {
      return "completed";
    }

    /*
     * If all are cancelled.
     */
    if (
      statuses.length > 0 &&
      statuses.every((status) => status === "cancelled")
    ) {
      return "cancelled";
    }

    return statuses[0] || "unknown";
  };

  // =====================================================
  // END: Get Group Status
  // =====================================================

  // =====================================================
  // START: Get Attendance Summary
  // =====================================================

  const getAttendanceSummary = (group) => {
    const attendance = group?.attendanceStatuses || [];

    const verified = attendance.filter(
      (item) => item === "verified"
    ).length;

    const absent = attendance.filter(
      (item) => item === "absent"
    ).length;

    const pending = attendance.filter(
      (item) => item === "pending"
    ).length;

    return {
      verified,
      absent,
      pending,
      total: attendance.length,
    };
  };

  // =====================================================
  // END: Get Attendance Summary
  // =====================================================

  // =====================================================
  // START: Filter Groups
  // =====================================================

  const filteredExams = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return groupedExams.filter((group) => {
      const exam = group?.exam;
      const invigilator = group?.invigilator;

      const matchesSearch =
        !searchText ||
        exam?.title
          ?.toLowerCase()
          .includes(searchText) ||
        invigilator?.name
          ?.toLowerCase()
          .includes(searchText) ||
        group?.students?.some((studentItem) => {
          const student = studentItem?.student;

          return (
            student?.name
              ?.toLowerCase()
              .includes(searchText) ||
            student?.email
              ?.toLowerCase()
              .includes(searchText) ||
            student?.rollNo
              ?.toLowerCase()
              .includes(searchText)
          );
        });

      const groupStatus = getGroupStatus(group);

      const matchesStatus =
        statusFilter === "all" ||
        groupStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    groupedExams,
    search,
    statusFilter,
  ]);

  // =====================================================
  // END: Filter Groups
  // =====================================================

  // =====================================================
  // START: Activate Entire Group
  // =====================================================

  const handleActivate = async (group) => {
    if (!group?.scheduledExamIds?.length) {
      toast.error("No scheduled students found");
      return;
    }

    const studentCount = group.scheduledExamIds.length;

    const confirmActivate = window.confirm(
      `Are you sure you want to activate this exam for all ${studentCount} student${
        studentCount > 1 ? "s" : ""
      }?`
    );

    if (!confirmActivate) {
      return;
    }

    try {
      setActivatingGroup(group.groupId);

      /*
       * Activate every ScheduledExam record
       * belonging to this group.
       */
      const results = [];

      for (const scheduledExamId of group.scheduledExamIds) {
        try {
          await updateScheduledExamStatus(
            scheduledExamId,
            "active"
          );

          results.push({
            id: scheduledExamId,
            success: true,
          });
        } catch (error) {
          console.error(
            `Failed to activate ${scheduledExamId}:`,
            error
          );

          results.push({
            id: scheduledExamId,
            success: false,
            error,
          });
        }
      }

      const successCount = results.filter(
        (item) => item.success
      ).length;

      const failedCount = results.filter(
        (item) => !item.success
      ).length;

      if (failedCount === 0) {
        toast.success(
          `Exam activated for all ${successCount} students`
        );
      } else if (successCount > 0) {
        toast.warning(
          `Activated ${successCount} students, but ${failedCount} failed`
        );
      } else {
        toast.error("Failed to activate exam");
      }

      await fetchScheduledExams(true);
    } catch (error) {
      console.error("Activate Group Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to activate exam"
      );
    } finally {
      setActivatingGroup(null);
    }
  };

  // =====================================================
  // END: Activate Entire Group
  // =====================================================

  // =====================================================
  // START: Cancel Entire Group
  // =====================================================

  const handleCancel = async (group) => {
    if (!group?.scheduledExamIds?.length) {
      toast.error("No scheduled students found");
      return;
    }

    const studentCount = group.scheduledExamIds.length;

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel this exam for all ${studentCount} student${
        studentCount > 1 ? "s" : ""
      }?`
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingGroup(group.groupId);

      const results = [];

      for (const scheduledExamId of group.scheduledExamIds) {
        try {
          await cancelScheduledExam(scheduledExamId);

          results.push({
            id: scheduledExamId,
            success: true,
          });
        } catch (error) {
          console.error(
            `Failed to cancel ${scheduledExamId}:`,
            error
          );

          results.push({
            id: scheduledExamId,
            success: false,
            error,
          });
        }
      }

      const successCount = results.filter(
        (item) => item.success
      ).length;

      const failedCount = results.filter(
        (item) => !item.success
      ).length;

      if (failedCount === 0) {
        toast.success(
          `Exam cancelled for all ${successCount} students`
        );
      } else if (successCount > 0) {
        toast.warning(
          `Cancelled ${successCount} students, but ${failedCount} failed`
        );
      } else {
        toast.error("Failed to cancel exam");
      }

      await fetchScheduledExams(true);
    } catch (error) {
      console.error("Cancel Group Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to cancel exam"
      );
    } finally {
      setCancellingGroup(null);
    }
  };

  // =====================================================
  // END: Cancel Entire Group
  // =====================================================

  // =====================================================
  // START: Status Badge
  // =====================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock size={13} />
            Scheduled
          </span>
        );

      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={13} />
            Active
          </span>
        );

      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <CheckCircle2 size={13} />
            Completed
          </span>
        );

      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={13} />
            Cancelled
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <AlertCircle size={13} />
            {status || "Unknown"}
          </span>
        );
    }
  };

  // =====================================================
  // END: Status Badge
  // =====================================================

  // =====================================================
  // START: Statistics
  // =====================================================

  /*
   * IMPORTANT:
   * Statistics now count groups, not individual students.
   */

  const totalCount = groupedExams.length;

  const scheduledCount = groupedExams.filter(
    (group) => getGroupStatus(group) === "scheduled"
  ).length;

  const activeCount = groupedExams.filter(
    (group) => getGroupStatus(group) === "active"
  ).length;

  const completedCount = groupedExams.filter(
    (group) => getGroupStatus(group) === "completed"
  ).length;

  // Total assigned students
  const totalStudents = scheduledExams.length;

  // =====================================================
  // END: Statistics
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* =====================================================
          START: Header
      ===================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Scheduled Exams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage scheduled exam groups, students and exam
            activation.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fetchScheduledExams(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/scheduled-exams/create")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Schedule Exam
          </button>
        </div>
      </div>

      {/* =====================================================
          END: Header
      ===================================================== */}

      {/* =====================================================
          START: Statistics
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Exams
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {totalCount}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {totalStudents} assigned students
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Scheduled
              </p>

              <h2 className="mt-2 text-2xl font-bold text-amber-600">
                {scheduledCount}
              </h2>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {activeCount}
              </h2>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Play size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <h2 className="mt-2 text-2xl font-bold text-blue-600">
                {completedCount}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          END: Statistics
      ===================================================== */}

      {/* =====================================================
          START: Filters
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
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
              placeholder="Search student, roll no, exam or invigilator..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">
              All Status
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          END: Filters
      ===================================================== */}

      {/* =====================================================
          START: Table
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshCw
                size={20}
                className="animate-spin"
              />

              Loading scheduled exams...
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
              <CalendarDays size={30} />
            </div>

            <h3 className="text-lg font-semibold text-gray-700">
              No scheduled exams found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              No scheduled exam matches your current
              search or filter.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/scheduled-exams/create")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Schedule Exam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Exam
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Students
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date & Time
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Invigilator
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attendance
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredExams.map((group) => {
                  const exam = group?.exam;
                  const invigilator =
                    group?.invigilator;

                  const groupStatus =
                    getGroupStatus(group);

                  const attendance =
                    getAttendanceSummary(group);

                  const isActivating =
                    activatingGroup ===
                    group.groupId;

                  const isCancelling =
                    cancellingGroup ===
                    group.groupId;

                  return (
                    <tr
                      key={group.groupId}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* =================================================
                          Exam
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {exam?.title || "-"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {exam?.duration
                              ? `${exam.duration} min`
                              : "-"}
                          </p>
                        </div>
                      </td>

                      {/* =================================================
                          Students
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {group.students
                              .slice(0, 4)
                              .map(
                                (
                                  studentItem,
                                  index
                                ) => {
                                  const student =
                                    studentItem?.student;

                                  return (
                                    <div
                                      key={
                                        studentItem?.scheduleId ||
                                        index
                                      }
                                      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-100 text-blue-600"
                                      title={
                                        student?.name ||
                                        "Student"
                                      }
                                    >
                                      {student?.image ? (
                                        <img
                                          src={
                                            student.image
                                          }
                                          alt={
                                            student?.name ||
                                            "Student"
                                          }
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <User
                                          size={16}
                                        />
                                      )}
                                    </div>
                                  );
                                }
                              )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {group.students.length}{" "}
                              Student
                              {group.students.length >
                              1
                                ? "s"
                                : ""}
                            </p>

                            <p className="text-xs text-gray-500">
                              {group.students
                                .slice(0, 2)
                                .map(
                                  (item) =>
                                    item?.student
                                      ?.name ||
                                    "-"
                                )
                                .join(", ")}

                              {group.students.length >
                              2
                                ? ` +${
                                    group.students
                                      .length - 2
                                  } more`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          Date & Time
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <CalendarDays
                            size={16}
                            className="mt-0.5 text-gray-400"
                          />

                          <div>
                            <p className="font-medium text-gray-700">
                              {formatDate(
                                group.startTime
                              )}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatTime(
                                group.startTime
                              )}{" "}
                              -{" "}
                              {formatTime(
                                group.endTime
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          Invigilator
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            size={17}
                            className="text-gray-400"
                          />

                          <div>
                            <p className="font-medium text-gray-700">
                              {invigilator?.name ||
                                "-"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {invigilator?.employeeId ||
                                ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          Attendance
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {attendance.verified >
                            0 && (
                            <p className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                              <CheckCircle2
                                size={13}
                              />
                              {attendance.verified}{" "}
                              Verified
                            </p>
                          )}

                          {attendance.pending >
                            0 && (
                            <p className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <Clock size={13} />
                              {attendance.pending}{" "}
                              Pending
                            </p>
                          )}

                          {attendance.absent >
                            0 && (
                            <p className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                              <XCircle
                                size={13}
                              />
                              {attendance.absent}{" "}
                              Absent
                            </p>
                          )}
                        </div>
                      </td>

                      {/* =================================================
                          Status
                      ================================================= */}

                      <td className="px-5 py-4">
                        {getStatusBadge(
                          groupStatus
                        )}
                      </td>

                      {/* =================================================
                          Actions
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/scheduled-exams/${group.scheduledExamIds[0]}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                            title="View Details"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {/* Activate Entire Group */}
                          {groupStatus ===
                            "scheduled" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActivate(
                                  group
                                )
                              }
                              disabled={
                                isActivating
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Activate for all students"
                            >
                              {isActivating ? (
                                <RefreshCw
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Play size={15} />
                              )}

                              {isActivating
                                ? "Activating..."
                                : "Activate"}
                            </button>
                          )}

                          {/* Cancel Entire Group */}
                          {(groupStatus ===
                            "scheduled" ||
                            groupStatus ===
                              "active") && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  group
                                )
                              }
                              disabled={
                                isCancelling
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Cancel for all students"
                            >
                              {isCancelling ? (
                                <RefreshCw
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <XCircle
                                  size={15}
                                />
                              )}

                              {isCancelling
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          )}
                        </div>
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
          END: Table
      ===================================================== */}

      {/* =====================================================
          START: Footer
      ===================================================== */}

      {!loading &&
        filteredExams.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {filteredExams.length} of{" "}
              {groupedExams.length} exam groups
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Users size={15} />

              {totalStudents} Assigned Students
            </span>
          </div>
        )}

      {/* =====================================================
          END: Footer
      ===================================================== */}
    </div>
  );
};

export default ScheduledExams;
