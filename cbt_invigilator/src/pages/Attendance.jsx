
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getAssignedExams } from "../services/invigilatorApi";

import {
  markAttendanceAbsent,
  verifyAttendance,
} from "../services/scheduledExamApi";

import SystemAllocation from
  "../components/SystemAllocation";

const NAVY = "var(--color-primary)";
const NAVY_HOVER = "var(--color-primary-hover)";

const Attendance = () => {
  const { invigilator } = useAuth();
  const location = useLocation();

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] =
    useState("all");

  const [selectedExamId, setSelectedExamId] = useState(
    location.state?.selectedExamId || "all"
  );

  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const invigilatorId =
    invigilator?._id || invigilator?.id;

  // --------------------------------------------------
  // LOAD ATTENDANCE RECORDS
  // --------------------------------------------------

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!invigilatorId) {
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAssignedExams(invigilatorId);

        setRecords(response?.exams || []);
      } catch (err) {
        console.error(
          "Attendance loading error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load attendance data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [invigilatorId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --------------------------------------------------
  // SUCCESS MESSAGE AUTO DISMISS
  // --------------------------------------------------

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // --------------------------------------------------
  // FORMAT DATE AND TIME
  // --------------------------------------------------

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------
  // RECORD HELPERS
  // --------------------------------------------------

  const getExamTitle = (record) => {
    if (
      record?.examId &&
      typeof record.examId === "object"
    ) {
      return record.examId?.title || "Untitled Exam";
    }

    return "Untitled Exam";
  };

  const getStudentName = (record) => {
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId?.name || "Unknown Student";
    }

    return "Unknown Student";
  };

  const getStudentEmail = (record) => {
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId?.email || "";
    }

    return "";
  };

  const getRollNo = (record) => {
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId?.rollNo || "—";
    }

    return "—";
  };

  const getCourse = (record) => {
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId?.course || "";
    }

    return "";
  };

  const getBranch = (record) => {
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId?.branch || "";
    }

    return "";
  };

  const getAttendanceStatus = (record) => {
    return record?.attendanceStatus || "pending";
  };

  const getStatus = (record) => {
    return record?.status || "scheduled";
  };

  // --------------------------------------------------
  // EXAM FILTER OPTIONS
  // --------------------------------------------------

  const examOptions = useMemo(() => {
    const map = new Map();

    records.forEach((record) => {
      const id =
        typeof record?.examId === "object"
          ? record.examId?._id
          : record?.examId;

      if (id) {
        map.set(id, getExamTitle(record));
      }
    });

    return Array.from(map.entries()).map(
      ([id, title]) => ({
        id,
        title,
      })
    );
  }, [records]);

  // --------------------------------------------------
  // ATTENDANCE STATISTICS
  // --------------------------------------------------

  const stats = useMemo(() => {
    const total = records.length;

    const verified = records.filter(
      (item) =>
        item.attendanceStatus === "verified"
    ).length;

    const pending = records.filter(
      (item) =>
        !item.attendanceStatus ||
        item.attendanceStatus === "pending"
    ).length;

    const absent = records.filter(
      (item) =>
        item.attendanceStatus === "absent"
    ).length;

    return {
      total,
      verified,
      pending,
      absent,
    };
  }, [records]);

  // --------------------------------------------------
  // SEARCH AND FILTER
  // --------------------------------------------------

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const examId =
        typeof record?.examId === "object"
          ? record.examId?._id
          : record?.examId;

      const attendanceStatus =
        getAttendanceStatus(record);

      const matchesExam =
        examFilter === "all" ||
        String(examId) === String(examFilter);

      const matchesSelectedExam =
        selectedExamId === "all" ||
        String(examId) === String(selectedExamId);

      const matchesAttendance =
        attendanceFilter === "all" ||
        attendanceStatus === attendanceFilter;

      const searchableText = [
        getExamTitle(record),
        getStudentName(record),
        getStudentEmail(record),
        getRollNo(record),
        getCourse(record),
        getBranch(record),
        record?.allocatedSystem || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return (
        matchesExam &&
        matchesSelectedExam &&
        matchesAttendance &&
        matchesSearch
      );
    });
  }, [
    records,
    search,
    examFilter,
    selectedExamId,
    attendanceFilter,
  ]);

  // --------------------------------------------------
  // VERIFY ATTENDANCE
  // --------------------------------------------------

  const handleVerify = async (record) => {
    if (!record?._id || !invigilatorId) return;

    if (
      getAttendanceStatus(record) !== "pending" ||
      ["cancelled", "completed", "absent"].includes(
        getStatus(record)
      )
    ) {
      setError(
        "This candidate cannot be verified in the current status."
      );
      return;
    }

    try {
      setProcessingId(record._id);
      setError("");
      setSuccessMessage("");

      await verifyAttendance(
        record._id,
        invigilatorId
      );

      setRecords((previous) =>
        previous.map((item) =>
          item._id === record._id
            ? {
                ...item,
                attendanceStatus: "verified",
                verifiedAt: new Date().toISOString(),
                verifiedBy: invigilator,
              }
            : item
        )
      );

      setSuccessMessage(
        `${getStudentName(record)}'s attendance has been verified.`
      );
    } catch (err) {
      console.error(
        "Verify attendance error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to verify attendance."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // MARK ABSENT
  // --------------------------------------------------

  const handleAbsent = async (record) => {
    if (!record?._id || !invigilatorId) return;

    if (getAttendanceStatus(record) !== "pending") {
      setError(
        "Only candidates with pending attendance can be marked absent."
      );
      return;
    }

    try {
      setProcessingId(record._id);
      setError("");
      setSuccessMessage("");

      await markAttendanceAbsent(
        record._id,
        invigilatorId
      );

      setRecords((previous) =>
        previous.map((item) =>
          item._id === record._id
            ? {
                ...item,
                attendanceStatus: "absent",
                status: "absent",
                accessGranted: false,
                verifiedAt: new Date().toISOString(),
                verifiedBy: invigilator,
              }
            : item
        )
      );

      setSuccessMessage(
        `${getStudentName(record)} has been marked absent.`
      );
    } catch (err) {
      console.error(
        "Mark absent error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to mark student absent."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // ATTENDANCE BADGES
  // --------------------------------------------------

  const getStatusBadge = (status) => {
    if (status === "verified") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-light)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
          <CheckCircle2 size={13} />
          Verified
        </span>
      );
    }

    if (status === "absent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={13} />
          Absent
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock3 size={13} />
        Pending
      </span>
    );
  };

  const getExamStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-slate-100 text-slate-600",
      active:
        "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
      completed: "bg-blue-50 text-blue-700",
      cancelled: "bg-red-50 text-red-700",
      absent: "bg-red-50 text-red-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
          styles[status] || styles.scheduled
        }`}
      >
        {status || "scheduled"}
      </span>
    );
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-white" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-[500px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <section
        className="relative overflow-hidden rounded-[30px] p-6 sm:p-8"
        style={{ backgroundColor: NAVY }}
      >
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
              <UserCheck size={14} />
              Attendance Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Student Attendance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Verify candidate attendance before granting
              access to the scheduled CBT examination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-success-border)] bg-[var(--color-success-light)] px-4 py-3.5 text-sm font-medium text-[var(--color-success)]"
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          label="Total Candidates"
          value={stats.total}
          description="Assigned to you"
        />

        <StatCard
          icon={CheckCircle2}
          label="Verified"
          value={stats.verified}
          description="Attendance confirmed"
          iconClass="bg-[var(--color-success-light)] text-[var(--color-success)]"
        />

        <StatCard
          icon={Clock3}
          label="Pending"
          value={stats.pending}
          description="Awaiting verification"
          iconClass="bg-amber-50 text-amber-700"
        />

        <StatCard
          icon={UserX}
          label="Absent"
          value={stats.absent}
          description="Marked absent"
          iconClass="bg-red-50 text-red-700"
        />
      </section>

      {/* Filters */}
      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search candidate, roll number, exam, course..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200/60"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            <FilterSelect
              value={examFilter}
              onChange={setExamFilter}
              options={[
                { value: "all", label: "All Exams" },
                ...examOptions.map((exam) => ({
                  value: exam.id,
                  label: exam.title,
                })),
              ]}
            />

            <FilterSelect
              value={attendanceFilter}
              onChange={setAttendanceFilter}
              options={[
                {
                  value: "all",
                  label: "All Attendance",
                },
                {
                  value: "pending",
                  label: "Pending",
                },
                {
                  value: "verified",
                  label: "Verified",
                },
                {
                  value: "absent",
                  label: "Absent",
                },
              ]}
            />

            {selectedExamId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedExamId("all")}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear Exam
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Attendance Register */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Attendance Register
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredRecords.length} of{" "}
              {records.length} assigned candidates
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <CalendarDays size={14} />
            Today:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            search={search}
            clearFilters={() => {
              setSearch("");
              setExamFilter("all");
              setAttendanceFilter("all");
              setSelectedExamId("all");
            }}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {[
                      "Candidate",
                      "Examination",
                      "Schedule",
                      "Attendance",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 ${
                          heading === "Actions"
                            ? "text-right"
                            : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <AttendanceRow
                      key={record._id}
                      record={record}
                      processingId={processingId}
                      onVerify={handleVerify}
                      onAbsent={handleAbsent}
                      getExamTitle={getExamTitle}
                      getStudentName={getStudentName}
                      getStudentEmail={getStudentEmail}
                      getRollNo={getRollNo}
                      getCourse={getCourse}
                      getBranch={getBranch}
                      getAttendanceStatus={getAttendanceStatus}
                      getStatus={getStatus}
                      getStatusBadge={getStatusBadge}
                      getExamStatusBadge={getExamStatusBadge}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile and Tablet Cards */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredRecords.map((record) => (
                <AttendanceMobileCard
                  key={record._id}
                  record={record}
                  processingId={processingId}
                  onVerify={handleVerify}
                  onAbsent={handleAbsent}
                  getExamTitle={getExamTitle}
                  getStudentName={getStudentName}
                  getStudentEmail={getStudentEmail}
                  getRollNo={getRollNo}
                  getCourse={getCourse}
                  getBranch={getBranch}
                  getAttendanceStatus={getAttendanceStatus}
                  getStatus={getStatus}
                  getStatusBadge={getStatusBadge}
                  getExamStatusBadge={getExamStatusBadge}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Separate System Allocation Component */}
      <SystemAllocation
        records={records}
        setRecords={setRecords}
        getStudentName={getStudentName}
      />
    </div>
  );
};

// ==================================================
// STATISTICS CARD
// ==================================================

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "bg-slate-100 text-slate-700",
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ==================================================
// FILTER SELECT
// ==================================================

const FilterSelect = ({
  value,
  onChange,
  options,
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-9 text-sm font-medium text-slate-600 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ==================================================
// DESKTOP ATTENDANCE ROW
// ==================================================

const AttendanceRow = ({
  record,
  processingId,
  onVerify,
  onAbsent,
  getExamTitle,
  getStudentName,
  getStudentEmail,
  getRollNo,
  getCourse,
  getBranch,
  getAttendanceStatus,
  getStatus,
  getStatusBadge,
  getExamStatusBadge,
  formatDate,
  formatTime,
}) => {
  const attendance = getAttendanceStatus(record);
  const isProcessing = processingId === record._id;

  const canVerify =
    attendance === "pending" &&
    !["cancelled", "completed", "absent"].includes(
      getStatus(record)
    );

  return (
    <tr className="align-top transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={getStudentName(record)}
            image={record?.studentId?.image}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {getStudentName(record)}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Roll No: {getRollNo(record)}
            </p>

            <p className="max-w-[190px] truncate text-[11px] text-slate-400">
              {getStudentEmail(record)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="max-w-[210px] text-sm font-semibold text-slate-700">
          {getExamTitle(record)}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {getCourse(record) && (
            <span className="text-[10px] text-slate-400">
              {getCourse(record)}
            </span>
          )}

          {getBranch(record) && (
            <>
              <span className="text-[10px] text-slate-300">
                •
              </span>

              <span className="text-[10px] text-slate-400">
                {getBranch(record)}
              </span>
            </>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-700">
          {formatDate(record.examDate)}
        </p>

        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <Clock3 size={11} />
          {formatTime(record.startTime)} –{" "}
          {formatTime(record.endTime)}
        </p>

        <div className="mt-2">
          {getExamStatusBadge(getStatus(record))}
        </div>
      </td>

      <td className="px-5 py-4">
        {getStatusBadge(attendance)}

        {record.verifiedAt && (
          <p className="mt-1.5 text-[10px] text-slate-400">
            {formatTime(record.verifiedAt)}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          {canVerify && (
            <>
              <button
                type="button"
                onClick={() => onVerify(record)}
                disabled={isProcessing}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={13} />
                )}
                Verify
              </button>

              <button
                type="button"
                onClick={() => onAbsent(record)}
                disabled={isProcessing}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <UserX size={13} />
                Absent
              </button>
            </>
          )}

          {attendance === "verified" && (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-success-light)] px-3 text-xs font-semibold text-[var(--color-success)]">
              <CheckCircle2 size={14} />
              Confirmed
            </span>
          )}

          {attendance === "absent" && (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700">
              <UserX size={14} />
              Absent
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

// ==================================================
// MOBILE ATTENDANCE CARD
// ==================================================

const AttendanceMobileCard = ({
  record,
  processingId,
  onVerify,
  onAbsent,
  getExamTitle,
  getStudentName,
  getStudentEmail,
  getRollNo,
  getCourse,
  getBranch,
  getAttendanceStatus,
  getStatus,
  getStatusBadge,
  getExamStatusBadge,
  formatDate,
  formatTime,
}) => {
  const attendance = getAttendanceStatus(record);
  const isProcessing = processingId === record._id;

  const canVerify =
    attendance === "pending" &&
    !["cancelled", "completed", "absent"].includes(
      getStatus(record)
    );

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={getStudentName(record)}
            image={record?.studentId?.image}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {getStudentName(record)}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Roll No: {getRollNo(record)}
            </p>

            <p className="truncate text-[11px] text-slate-400">
              {getStudentEmail(record)}
            </p>
          </div>
        </div>

        {getStatusBadge(attendance)}
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold text-slate-800">
          {getExamTitle(record)}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {getCourse(record) && (
            <span className="text-[10px] text-slate-500">
              {getCourse(record)}
            </span>
          )}

          {getBranch(record) && (
            <>
              <span className="text-[10px] text-slate-300">
                •
              </span>

              <span className="text-[10px] text-slate-500">
                {getBranch(record)}
              </span>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {formatDate(record.examDate)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {formatTime(record.startTime)} –{" "}
            {formatTime(record.endTime)}
          </span>

          {getExamStatusBadge(getStatus(record))}
        </div>
      </div>

      {canVerify && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onVerify(record)}
            disabled={isProcessing}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw
                size={14}
                className="animate-spin"
              />
            ) : (
              <Check size={14} />
            )}
            Verify Attendance
          </button>

          <button
            type="button"
            onClick={() => onAbsent(record)}
            disabled={isProcessing}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700 disabled:opacity-50"
          >
            <UserX size={14} />
            Mark Absent
          </button>
        </div>
      )}
    </div>
  );
};

// ==================================================
// AVATAR
// ==================================================

const Avatar = ({ name, image }) => {
  const initials = name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
      style={{ backgroundColor: NAVY_HOVER }}
    >
      {initials || "ST"}
    </div>
  );
};

// ==================================================
// EMPTY STATE
// ==================================================

const EmptyState = ({
  search,
  clearFilters,
}) => (
  <div className="flex min-h-[360px] flex-col items-center justify-center px-5 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Search size={24} />
    </div>

    <h3 className="mt-4 text-sm font-bold text-slate-800">
      {search
        ? "No matching candidates"
        : "No attendance records"}
    </h3>

    <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
      {search
        ? "Try a different candidate name, roll number, exam or course."
        : "There are currently no assigned candidates available for attendance verification."}
    </p>

    <button
      type="button"
      onClick={clearFilters}
      className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)]"
    >
      Clear Filters
    </button>
  </div>
);

export default Attendance;
