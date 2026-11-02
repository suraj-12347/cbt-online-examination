
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  CalendarDays,
  Clock3,
  ChevronDown,
  Users,
  Monitor,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  AlertCircle,
  LoaderCircle,
  UserRound,
  ShieldCheck,
  CircleDot,
  Laptop,
  Timer,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getAssignedExams } from "../services/invigilatorApi";

import {
  verifyAttendance,
  markAttendanceAbsent,
  allocateSystem,
} from "../services/scheduledExamApi";

import { getAvailableSystems } from "../services/systemApi";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const getId = (value) =>
  typeof value === "object" && value !== null
    ? value._id || value.id
    : value;

const getStudentName = (student) =>
  student?.name || student?.fullName || "Unknown Student";

const getCourse = (student) =>
  student?.course ||
  student?.branch ||
  student?.program ||
  "Course not specified";

const getSemester = (student) =>
  student?.semester ?? student?.currentSemester ?? null;

const getExamTitle = (record) =>
  record?.examId?.title ||
  record?.examTitle ||
  "Scheduled Examination";

const getAttendance = (record) =>
  String(record?.attendanceStatus || "pending").toLowerCase();

const getExamStatus = (record) =>
  String(record?.status || "scheduled").toLowerCase();

const getLabName = (system) => {
  const lab = system?.labName || system?.lab?.name || system?.lab;

  return typeof lab === "string" ? lab.trim() : "";
};

const formatDate = (value) => {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDuration = (start, end) => {
  if (!start || !end) return null;

  const minutes = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );

  return minutes > 0 ? `${minutes} min` : null;
};

const getExamTiming = (startTime, endTime, now) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { label: "Time unavailable", type: "unknown" };
  }

  if (now >= end) {
    return { label: "Exam ended", type: "ended" };
  }

  if (now >= start) {
    return { label: "Exam is live", type: "live" };
  }

  const minutes = Math.ceil((start - now) / 60000);

  if (minutes <= 1) {
    return { label: "Starting now", type: "soon" };
  }

  if (minutes < 60) {
    return {
      label: `Starts in ${minutes} minutes`,
      type: minutes <= 15 ? "soon" : "upcoming",
    };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return {
      label:
        remainingMinutes > 0
          ? `Starts in ${hours}h ${remainingMinutes}m`
          : `Starts in ${hours} hour${hours === 1 ? "" : "s"}`,
      type: "upcoming",
    };
  }

  const days = Math.floor(hours / 24);

  return {
    label: `Starts in ${days} day${days === 1 ? "" : "s"}`,
    type: "upcoming",
  };
};

const getStatusStyle = (status) => {
  const styles = {
    scheduled: "bg-blue-50 text-blue-700 border-blue-100",
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-100",
    absent: "bg-red-50 text-red-700 border-red-100",
  };

  return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(
      status
    )}`}
  >
    {status || "pending"}
  </span>
);

/* -------------------------------------------------------
   GROUP SCHEDULED EXAMS
------------------------------------------------------- */

const groupScheduledRecords = (records, now) => {
  const groups = new Map();

  records.forEach((record) => {
    const examId = getId(record?.examId);

    const date = record?.examDate
      ? new Date(record.examDate).toISOString().slice(0, 10)
      : "";

    const start = record?.startTime
      ? new Date(record.startTime).toISOString()
      : "";

    const end = record?.endTime
      ? new Date(record.endTime).toISOString()
      : "";

    const key = [examId, date, start, end].join("__");

    if (!groups.has(key)) {
      const startMs = new Date(record?.startTime).getTime();
      const endMs = new Date(record?.endTime).getTime();

      let timingType = "upcoming";

      if (record?.status === "cancelled") {
        timingType = "cancelled";
      } else if (record?.status === "completed" || now >= endMs) {
        timingType = "ended";
      } else if (now >= startMs) {
        timingType = "live";
      }

      groups.set(key, {
        key,
        examId,
        title: getExamTitle(record),
        description: record?.examId?.description || "",
        date: record?.examDate,
        startTime: record?.startTime,
        endTime: record?.endTime,
        status: getExamStatus(record),
        timingType,
        records: [],
      });
    }

    groups.get(key).records.push(record);
  });

  const priority = (exam) => {
    if (exam.status === "cancelled") return 3;
    if (exam.timingType === "ended") return 2;
    if (exam.timingType === "live") return 0;
    return 1;
  };

  return Array.from(groups.values()).sort((a, b) => {
    const difference = priority(a) - priority(b);

    if (difference !== 0) return difference;

    return (
      new Date(a.startTime || a.date || 0).getTime() -
      new Date(b.startTime || b.date || 0).getTime()
    );
  });
};

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone = "green",
}) => {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${tones[tone] || tones.green}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   COUNTDOWN
------------------------------------------------------- */

const Countdown = ({ exam, now, highlighted = false }) => {
  const timing = getExamTiming(exam.startTime, exam.endTime, now);

  const styles = {
    soon: highlighted
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : "bg-amber-50 text-amber-800 border-amber-100",
    upcoming: highlighted
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : "bg-blue-50 text-blue-700 border-blue-100",
    live: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ended: "bg-gray-100 text-gray-500 border-gray-200",
    unknown: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
        styles[timing.type] || styles.unknown
      }`}
    >
      {timing.type === "live" ? (
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
      ) : (
        <Timer size={14} />
      )}

      {timing.label}
    </span>
  );
};

/* -------------------------------------------------------
   CANDIDATE ROW
------------------------------------------------------- */

const CandidateRow = ({
  record,
  onVerify,
  onAbsent,
  onAllocate,
  busy,
  canManage,
  systems,
  systemsLoading,
}) => {
  const student = record?.studentId || {};
  const attendance = getAttendance(record);

  const [selectedLab, setSelectedLab] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState("");

  const isBusy = busy === record?._id;
  const studentName = getStudentName(student);

  // Only available systems are shown in the lab dropdown.
  const availableSystems = useMemo(
    () =>
      systems.filter(
        (system) =>
          String(system?.status || "").toLowerCase() === "available"
      ),
    [systems]
  );

  // Unique lab names; system records are not deduplicated.
  const labs = useMemo(() => {
    const names = availableSystems
      .map(getLabName)
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [availableSystems]);

  // Only available computers belonging to the selected lab.
  const filteredSystems = useMemo(() => {
    if (!selectedLab) return [];

    return availableSystems.filter(
      (system) => getLabName(system) === selectedLab
    );
  }, [availableSystems, selectedLab]);

  useEffect(() => {
    setSelectedLab("");
    setSelectedSystemId("");
  }, [record?._id, record?.allocatedSystem]);

  const handleLabChange = (labName) => {
    setSelectedLab(labName);
    setSelectedSystemId("");
  };

  const handleAssign = () => {
    const system = filteredSystems.find(
      (item) => String(item._id || item.id) === selectedSystemId
    );

    if (!system) return;

    onAllocate(record._id, system);
  };

  return (
    <div className="grid gap-4 border-b border-gray-100 p-4 last:border-b-0 hover:bg-gray-50/70 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center">
      {/* Candidate details */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <UserRound size={20} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">
            {studentName}
          </p>

          <p className="mt-0.5 truncate text-xs text-gray-500">
            Roll No:{" "}
            {student?.rollNo || student?.rollNumber || "Not provided"}
          </p>

          <p className="mt-1 truncate text-xs text-gray-400">
            {getCourse(student)}
            {getSemester(student) !== null &&
              getSemester(student) !== undefined && (
                <span className="ml-1.5">
                  • Semester {getSemester(student)}
                </span>
              )}
          </p>
        </div>
      </div>

      {/* Attendance and allocated system */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={attendance} />

       {record?.allocatedSystem && (
  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
    <CheckCircle2 size={16} />
    System Assigned: {record.allocatedSystem}
  </div>
)}
      </div>

      {/* Candidate actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
        {canManage &&
  attendance === "verified" &&
  !record?.allocatedSystem && (
          <>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onVerify(record._id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isBusy ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Verify
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => onAbsent(record._id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle size={14} />
              Absent
            </button>
          </>
        )}

        {/* Show lab/system dropdowns after verification */}
       {canManage &&
  attendance === "verified" &&
  record?.allocatedSystem && (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
      <CheckCircle2 size={16} className="shrink-0 text-emerald-700" />

      <div>
        <p className="text-xs font-bold text-emerald-800">
          System Assigned
        </p>

        <p className="mt-0.5 text-xs text-emerald-700">
          {typeof record.allocatedSystem === "object"
            ? record.allocatedSystem.name ||
              record.allocatedSystem.systemNumber ||
              "Allocated"
            : record.allocatedSystem}
        </p>
      </div>
    </div>
  )}

        {!canManage && (
          <span className="text-xs text-gray-400">
            {getExamStatus(record) === "cancelled"
              ? "Exam cancelled"
              : "Verification unavailable"}
          </span>
        )}

        {canManage && attendance === "absent" && (
          <span className="text-xs text-red-600">
            Candidate marked absent
          </span>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   EXAM DETAILS
------------------------------------------------------- */

const ExamDetails = ({
  exam,
  now,
  onBack,
  onVerify,
  onAbsent,
  onAllocate,
  busy,
  systems,
  systemsLoading,
}) => {
  const records = exam.records || [];

  const verified = records.filter(
    (record) => getAttendance(record) === "verified"
  ).length;

  const absent = records.filter(
    (record) => getAttendance(record) === "absent"
  ).length;

  const pending = records.filter(
    (record) => getAttendance(record) === "pending"
  ).length;

  const timing = getExamTiming(exam.startTime, exam.endTime, now);

  const canManage =
    exam.status !== "cancelled" &&
    exam.status !== "completed" &&
    timing.type !== "ended";

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-700"
      >
        <ArrowLeft size={17} />
        Back to My Exams
      </button>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="bg-gradient-to-r from-[#103d2b] to-[#176044] p-5 text-white sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <BookOpen size={24} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                  Examination Session
                </p>

                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  {exam.title}
                </h2>

                {exam.description && (
                  <p className="mt-1 max-w-2xl text-sm text-emerald-50/80">
                    {exam.description}
                  </p>
                )}
              </div>
            </div>

            <StatusBadge status={exam.status} />
          </div>

          <div className="mt-5">
            <Countdown exam={exam} now={now} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <CalendarDays size={17} className="text-emerald-100" />
              <p className="mt-2 text-xs text-emerald-100">Exam Date</p>
              <p className="mt-1 text-sm font-semibold">
                {formatDate(exam.date)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <Clock3 size={17} className="text-emerald-100" />
              <p className="mt-2 text-xs text-emerald-100">Exam Timing</p>
              <p className="mt-1 text-sm font-semibold">
                {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <Users size={17} className="text-emerald-100" />
              <p className="mt-2 text-xs text-emerald-100">
                Assigned Candidates
              </p>
              <p className="mt-1 text-sm font-semibold">
                {records.length} candidates
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 sm:p-5">
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-amber-700">Pending</p>
            <p className="mt-1 text-xl font-bold text-amber-800">
              {pending}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">Verified</p>
            <p className="mt-1 text-xl font-bold text-emerald-800">
              {verified}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-xs text-red-700">Absent</p>
            <p className="mt-1 text-xl font-bold text-red-800">
              {absent}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h3 className="font-bold text-gray-900">
              Candidate Verification Register
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Verify the candidate, record attendance, then assign a lab
              computer.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
            <ShieldCheck size={15} />
            Invigilator desk
          </span>
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto text-gray-300" size={32} />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              No candidates assigned
            </p>
          </div>
        ) : (
          <div>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-4 bg-gray-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 lg:grid">
              <span>Candidate</span>
              <span>Attendance / System</span>
              <span className="text-right">Actions</span>
            </div>

            {records.map((record) => (
              <CandidateRow
                key={record._id}
                record={record}
                onVerify={onVerify}
                onAbsent={onAbsent}
                onAllocate={onAllocate}
                busy={busy}
                canManage={canManage}
                systems={systems}
                systemsLoading={systemsLoading}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-blue-700" />
        <p className="text-xs leading-5 text-blue-800">
          System availability and candidate allocation must be validated by
          the backend against the logged-in invigilator and assigned exam.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   MAIN EXAMS COMPONENT
------------------------------------------------------- */

const Exams = () => {
  const { invigilator } = useAuth();

  const invigilatorId = invigilator?._id || invigilator?.id;

  const [records, setRecords] = useState([]);
  const [systems, setSystems] = useState([]);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [now, setNow] = useState(Date.now());

  /* Countdown clock */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  /* -----------------------------------------------------
     LOAD AVAILABLE SYSTEMS

     Supports these response shapes:
     { success: true, systems: [...] }
     Axios response: { data: { success: true, systems: [...] } }
  ----------------------------------------------------- */

  const loadAvailableSystems = useCallback(async () => {
    setSystemsLoading(true);

    try {
      const response = await getAvailableSystems();

      const payload = response?.data ?? response;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.systems)
        ? payload.systems
        : Array.isArray(payload?.data?.systems)
        ? payload.data.systems
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      console.log("Available systems API response:", response);
      console.log("Parsed available systems:", list);

      setSystems(
        list.filter(
          (system) =>
            String(system?.status || "").toLowerCase() === "available"
        )
      );
    } catch (err) {
      console.error(
        "Failed to load available systems:",
        err?.response?.data || err?.message
      );

      setSystems([]);

      setNotice({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Unable to load available systems. Please check the systems API.",
      });
    } finally {
      setSystemsLoading(false);
    }
  }, []);

  /* Load exams */
  const loadExams = useCallback(
    async (isRefresh = false) => {
      if (!invigilatorId) {
        setRecords([]);
        setLoading(false);
        setError("Invigilator account is unavailable. Please sign in again.");
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const response = await getAssignedExams();

        const payload = response?.data ?? response;

        const list = Array.isArray(payload?.exams)
          ? payload.exams
          : Array.isArray(payload?.data?.exams)
          ? payload.data.exams
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];

        setRecords(list);

        setSelectedKey((current) =>
          current && list.some((item) => item._id === current)
            ? current
            : null
        );
      } catch (err) {
        console.error("Failed to load assigned exams:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load assigned exams. Check your connection and API configuration."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [invigilatorId]
  );

  useEffect(() => {
    loadExams();
    loadAvailableSystems();
  }, [loadExams, loadAvailableSystems]);

  /* Group sessions */
  const sessions = useMemo(
    () => groupScheduledRecords(records, now),
    [records, now]
  );

  /* Search and status filters */
  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesStatus =
        statusFilter === "all" || session.status === statusFilter;

      const matchesSearch =
        !query ||
        session.title.toLowerCase().includes(query) ||
        session.records.some((record) => {
          const student = record.studentId || {};

          return (
            getStudentName(student).toLowerCase().includes(query) ||
            String(student.rollNo || student.rollNumber || "")
              .toLowerCase()
              .includes(query) ||
            getCourse(student).toLowerCase().includes(query)
          );
        });

      return matchesStatus && matchesSearch;
    });
  }, [sessions, search, statusFilter]);

  const selectedExam = useMemo(
    () => sessions.find((session) => session.key === selectedKey) || null,
    [sessions, selectedKey]
  );

  const nextExamKey = useMemo(() => {
    const eligible = sessions
      .filter(
        (exam) =>
          exam.status !== "cancelled" &&
          exam.timingType === "upcoming"
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      );

    return eligible[0]?.key || null;
  }, [sessions]);

  const totals = useMemo(() => {
    const allRecords = sessions.flatMap((session) => session.records);

    return {
      sessions: sessions.length,
      candidates: allRecords.length,
      pending: allRecords.filter(
        (record) => getAttendance(record) === "pending"
      ).length,
      verified: allRecords.filter(
        (record) => getAttendance(record) === "verified"
      ).length,
    };
  }, [sessions]);

  const updateRecord = (id, patch) => {
    setRecords((current) =>
      current.map((record) =>
        record._id === id ? { ...record, ...patch } : record
      )
    );
  };

  /* Verify candidate */
  const handleVerify = async (id) => {
    if (!invigilatorId) {
      setNotice({
        type: "error",
        message: "Please sign in again.",
      });
      return;
    }

    setBusy(id);
    setNotice(null);

    try {
      const response = await verifyAttendance(id, invigilatorId);
      const payload = response?.data ?? response;

      updateRecord(id, {
        attendanceStatus: "verified",
        verifiedAt: payload?.verifiedAt || new Date().toISOString(),
        verifiedBy: invigilatorId,
        accessGranted: false,
      });

      setNotice({
        type: "success",
        message:
          payload?.message ||
          "Candidate attendance verified successfully.",
      });
    } catch (err) {
      console.error(
        "Verify attendance failed:",
        err?.response?.data || err?.message
      );

      setNotice({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Could not verify attendance. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  };

  /* Mark absent */
  const handleAbsent = async (id) => {
    if (!invigilatorId) {
      setNotice({
        type: "error",
        message: "Please sign in again.",
      });
      return;
    }

    const confirmed = window.confirm(
      "Mark this candidate as absent? Please confirm the candidate's status first."
    );

    if (!confirmed) return;

    setBusy(id);
    setNotice(null);

    try {
      await markAttendanceAbsent(id, invigilatorId);

      updateRecord(id, {
        attendanceStatus: "absent",
        accessGranted: false,
      });

      setNotice({
        type: "success",
        message: "Candidate marked absent.",
      });
    } catch (err) {
      console.error("Mark absent failed:", err?.response?.data || err);

      setNotice({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Could not update attendance.",
      });
    } finally {
      setBusy(null);
    }
  };

  /* Allocate the selected computer to the candidate */
 const handleAllocate = async (id, system) => {
  const candidate = records.find(
    (record) => String(record._id) === String(id)
  );

  // Validate invigilator and system
  if (!invigilatorId || !system?.name) {
    setNotice({
      type: "error",
      message: "Please select a valid available system.",
    });
    return;
  }

  // Prevent assigning a second system to the same candidate
  if (candidate?.allocatedSystem) {
    setNotice({
      type: "error",
      message: "A system has already been assigned to this candidate.",
    });
    return;
  }

  // Attendance must be verified first
  if (getAttendance(candidate) !== "verified") {
    setNotice({
      type: "error",
      message:
        "Verify the candidate's attendance before assigning a system.",
    });
    return;
  }

  // Check whether the selected system is still available locally
  const systemId = String(system._id || system.id);

  const isAvailable = systems.some(
    (item) =>
      String(item._id || item.id) === systemId &&
      String(item.status || "").toLowerCase() === "available"
  );

  if (!isAvailable) {
    setNotice({
      type: "error",
      message: "This system is no longer available. Please refresh the list.",
    });

    await loadAvailableSystems();
    return;
  }

  setBusy(id);
  setNotice(null);

  try {
    const response = await allocateSystem(
      id,
      system.name,
      invigilatorId
    );

    const payload = response?.data ?? response;

    // Update candidate immediately in the UI
    updateRecord(id, {
      allocatedSystem: system.name,
      allocatedAt: new Date().toISOString(),
    });

    // Remove assigned system from the available list
    setSystems((current) =>
      current.filter(
        (item) =>
          String(item._id || item.id) !== systemId
      )
    );

    setNotice({
      type: "success",
      message:
        payload?.message ||
        `${system.name} allocated to the candidate successfully.`,
    });

    // Don't reload the systems here.
    // The backend must update the system's status to "allocated".
  } catch (err) {
    console.error(
      "System allocation failed:",
      err?.response?.data || err?.message
    );

    setNotice({
      type: "error",
      message:
        err?.response?.data?.message ||
        "Could not allocate this system. Please try again.",
    });
  } finally {
    setBusy(null);
  }
};

  /* Notice message */
  const Notice = () =>
    notice ? (
      <div
        role="status"
        className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
          notice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {notice.type === "success" ? (
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
        )}

        <span>{notice.message}</span>

        <button
          type="button"
          onClick={() => setNotice(null)}
          className="ml-auto text-xs font-bold"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      </div>
    ) : null;

  /* Exam detail page */
  if (selectedExam) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-5">
        <Notice />

        <ExamDetails
          exam={selectedExam}
          now={now}
          onBack={() => {
            setSelectedKey(null);
            setNotice(null);
          }}
          onVerify={handleVerify}
          onAbsent={handleAbsent}
          onAllocate={handleAllocate}
          busy={busy}
          systems={systems}
          systemsLoading={systemsLoading}
        />
      </div>
    );
  }

  /* Main dashboard */
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck size={15} />
            Examination Control
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Exams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your next examination, candidate verification and lab allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadExams(true);
            loadAvailableSystems();
          }}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Assigned Sessions"
          value={totals.sessions}
          tone="green"
        />

        <StatCard
          icon={Users}
          label="Assigned Candidates"
          value={totals.candidates}
          tone="blue"
        />

        <StatCard
          icon={ClipboardCheck}
          label="Pending Verification"
          value={totals.pending}
          tone="amber"
        />

        <StatCard
          icon={CheckCircle2}
          label="Verified Candidates"
          value={totals.verified}
          tone="green"
        />
      </div>

      <Notice />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold text-gray-900">
              Assigned Examination Schedule
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Your nearest upcoming examination is highlighted automatically.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <CircleDot size={13} />
            {filteredSessions.length} sessions
          </span>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exam, candidate, roll number or course..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by exam status"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center px-5 py-16">
            <LoaderCircle
              size={30}
              className="animate-spin text-emerald-700"
            />

            <p className="mt-3 text-sm font-semibold text-gray-700">
              Loading your assigned exams...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center sm:p-12">
            <AlertCircle size={28} className="mx-auto text-red-600" />

            <h3 className="mt-4 font-bold text-gray-900">
              Could not load examinations
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadExams()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center sm:p-14">
            <CalendarDays size={30} className="mx-auto text-gray-300" />

            <h3 className="mt-4 font-bold text-gray-900">
              {sessions.length === 0
                ? "No exams assigned yet"
                : "No matching exams"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {sessions.length === 0
                ? "When the administrator assigns an examination to your account, it will appear here."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
            {filteredSessions.map((exam) => {
              const candidates = exam.records.length;

              const verified = exam.records.filter(
                (record) => getAttendance(record) === "verified"
              ).length;

              const pending = exam.records.filter(
                (record) => getAttendance(record) === "pending"
              ).length;

              const isNext = exam.key === nextExamKey;
              const isLive = exam.timingType === "live";

              return (
                <article
                  key={exam.key}
                  className={`group overflow-hidden rounded-2xl border bg-white transition ${
                    isNext
                      ? "border-emerald-500 ring-2 ring-emerald-100 shadow-lg shadow-emerald-900/5"
                      : isLive
                      ? "border-blue-300 ring-1 ring-blue-100"
                      : "border-gray-200 hover:border-emerald-200 hover:shadow-md"
                  }`}
                >
                  {isNext && (
                    <div className="flex items-center justify-between gap-2 bg-emerald-700 px-4 py-2 text-white">
                      <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]">
                        <Zap size={14} />
                        Next Upcoming Exam
                      </span>

                      <span className="text-[10px] font-semibold text-emerald-100">
                        Priority session
                      </span>
                    </div>
                  )}

                  {isLive && !isNext && (
                    <div className="flex items-center gap-2 bg-blue-700 px-4 py-2 text-white">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

                      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                        Exam In Progress
                      </span>
                    </div>
                  )}

                  <div
                    className={`border-b p-4 sm:p-5 ${
                      isNext
                        ? "border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isNext
                            ? "bg-emerald-700 text-white"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <BookOpen size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={exam.status} />

                          {isNext && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                              First priority
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-base font-bold text-gray-900">
                          {exam.title}
                        </h3>

                        {exam.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Countdown
                        exam={exam}
                        now={now}
                        highlighted={isNext}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarDays size={14} />
                          Exam Date
                        </div>

                        <p className="mt-1.5 text-sm font-semibold text-gray-800">
                          {formatDate(exam.date)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock3 size={14} />
                          Exam Timing
                        </div>

                        <p className="mt-1.5 text-sm font-semibold text-gray-800">
                          {formatTime(exam.startTime)} –{" "}
                          {formatTime(exam.endTime)}
                        </p>

                        {getDuration(exam.startTime, exam.endTime) && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            Duration:{" "}
                            {getDuration(exam.startTime, exam.endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <Users size={15} className="text-gray-400" />
                        <strong className="text-gray-900">
                          {candidates}
                        </strong>
                        Candidates
                      </span>

                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={14} />
                        {verified} verified
                      </span>

                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Clock3 size={14} />
                        {pending} pending
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(exam.key);
                        setNotice(null);
                      }}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition sm:px-4 ${
                        isNext
                          ? "bg-emerald-700 hover:bg-emerald-800"
                          : "bg-[#124a33] hover:bg-[#0d3826]"
                      }`}
                    >
                      Open
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {exam.records[0]?.studentId && (
                    <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <GraduationCap
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="truncate">
                          {getCourse(exam.records[0].studentId)}
                        </span>

                        {getSemester(exam.records[0].studentId) !== null &&
                          getSemester(exam.records[0].studentId) !==
                            undefined && (
                            <span className="shrink-0 text-gray-400">
                              • Semester{" "}
                              {getSemester(exam.records[0].studentId)}
                            </span>
                          )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Laptop size={18} className="mt-0.5 shrink-0 text-gray-500" />

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Invigilation workflow
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Open the assigned session, verify candidate identity, record
            attendance, and allocate the designated lab computer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Exams;
