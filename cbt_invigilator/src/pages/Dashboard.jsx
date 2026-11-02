import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ClipboardCheck,
  Users,
  Monitor,
  ArrowUpRight,
  AlertCircle,
  PlayCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getAssignedExams } from "../services/invigilatorApi";

const Dashboard = () => {
  const navigate = useNavigate();
  const { invigilator } = useAuth();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadExams = async (isRefresh = false) => {
    if (!invigilator?._id && !invigilator?.id) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const invigilatorId =
        invigilator._id || invigilator.id;

      const response = await getAssignedExams(
        invigilatorId
      );

      setExams(response?.exams || []);
    } catch (err) {
      console.error("Dashboard exams error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load assigned examinations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [invigilator]);

  const getDate = (exam) => {
    return exam.examDate || exam.startTime;
  };

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getStatus = (exam) => {
    if (exam.status === "absent") return "absent";
    if (exam.status === "cancelled") return "cancelled";
    if (exam.status === "completed") return "completed";
    if (exam.status === "active") return "active";

    return "scheduled";
  };

  const stats = useMemo(() => {
    const today = exams.filter((exam) =>
      isToday(getDate(exam))
    );

    const active = exams.filter(
      (exam) => getStatus(exam) === "active"
    );

    const pendingAttendance = exams.filter(
      (exam) =>
        exam.attendanceStatus === "pending" &&
        getStatus(exam) !== "cancelled" &&
        getStatus(exam) !== "completed"
    );

    const verified = exams.filter(
      (exam) => exam.attendanceStatus === "verified"
    );

    const uniqueStudents = new Set(
      exams
        .map((exam) => {
          const student =
            typeof exam.studentId === "object"
              ? exam.studentId?._id
              : exam.studentId;

          return student;
        })
        .filter(Boolean)
    );

    return {
      total: exams.length,
      today: today.length,
      active: active.length,
      pendingAttendance: pendingAttendance.length,
      verified: verified.length,
      students: uniqueStudents.size,
    };
  }, [exams]);

  const upcomingExams = useMemo(() => {
    return [...exams]
      .filter(
        (exam) =>
          getStatus(exam) !== "cancelled" &&
          getStatus(exam) !== "completed" &&
          getStatus(exam) !== "absent"
      )
      .sort(
        (a, b) =>
          new Date(a.startTime) -
          new Date(b.startTime)
      )
      .slice(0, 6);
  }, [exams]);

  const formatTime = (dateValue) => {
    if (!dateValue) return "--";

    return new Date(dateValue).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "--";

    return new Date(dateValue).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getExamTitle = (exam) => {
    if (
      exam.examId &&
      typeof exam.examId === "object"
    ) {
      return exam.examId.title || "Untitled Exam";
    }

    return "Untitled Exam";
  };

  const getStudent = (exam) => {
    if (
      exam.studentId &&
      typeof exam.studentId === "object"
    ) {
      return exam.studentId;
    }

    return null;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return {
          badge:
            "bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-border)]",
          dot: "bg-[var(--color-primary)]",
        };

      case "completed":
        return {
          badge:
            "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };

      case "cancelled":
        return {
          badge:
            "bg-red-50 text-red-600 border-red-100",
          dot: "bg-red-500",
        };

      case "absent":
        return {
          badge:
            "bg-orange-50 text-orange-600 border-orange-100",
          dot: "bg-orange-500",
        };

      default:
        return {
          badge:
            "bg-blue-50 text-blue-700 border-blue-100",
          dot: "bg-blue-500",
        };
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto">
      {/* Welcome */}
      <section className="mb-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[var(--color-primary)]">
              Examination Control Center
            </p>

            <h1 className="mt-1.5 text-[25px] sm:text-[29px] font-extrabold tracking-[-0.035em] text-slate-800">
              Good day,{" "}
              {invigilator?.name?.split(" ")[0] ||
                "Invigilator"}
              .
            </h1>

            <p className="mt-1.5 text-sm text-slate-400">
              Here's what's happening with your assigned
              examinations.
            </p>
          </div>

          <button
            onClick={() => loadExams(true)}
            disabled={refreshing}
            className="
              self-start sm:self-auto
              h-10 px-3.5
              rounded-xl
              border border-slate-200
              bg-white
              text-xs font-semibold text-slate-600
              flex items-center gap-2
              hover:border-[var(--color-primary)]/20
              hover:text-[var(--color-primary)]
              hover:bg-slate-50
              transition
            "
          >
            <RefreshCw
              size={14}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle
              size={18}
              className="text-red-500 shrink-0"
            />
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>

          <button
            onClick={() => loadExams()}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total Exams"
          value={stats.total}
          icon={ClipboardCheck}
          iconBg="bg-[var(--color-primary-light)]"
          iconColor="text-[var(--color-primary)]"
        />

        <StatCard
          label="Today's Exams"
          value={stats.today}
          icon={CalendarDays}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          label="Active Now"
          value={stats.active}
          icon={PlayCircle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          live={stats.active > 0}
        />

        <StatCard
          label="Pending Attendance"
          value={stats.pendingAttendance}
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </section>

      {/* Main grid */}
      <div className="grid xl:grid-cols-[1fr_340px] gap-5">
        {/* Exams */}
        <section className="bg-white rounded-[22px] border border-slate-200/80 shadow-[0_8px_35px_rgba(15,23,42,0.035)] overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">
                Upcoming Examinations
              </h2>

              <p className="text-[11px] text-slate-400 mt-1">
                Your next assigned examination sessions
              </p>
            </div>

            <button
              onClick={() => navigate("/exams")}
              className="
                flex items-center gap-1
                text-[11px] font-semibold
                text-[var(--color-primary)]
                hover:gap-2
                transition-all
              "
            >
              View all
              <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <LoadingRows />
          ) : upcomingExams.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingExams.map((exam) => {
                const status = getStatus(exam);
                const statusStyle =
                  getStatusClasses(status);
                const student = getStudent(exam);

                return (
                  <div
                    key={exam._id}
                    className="px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Date */}
                      <div className="hidden sm:flex w-[58px] h-[58px] rounded-xl bg-slate-50 border border-slate-100 flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {new Date(
                            getDate(exam)
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                            }
                          )}
                        </span>

                        <span className="text-lg font-extrabold text-slate-700 leading-5">
                          {new Date(
                            getDate(exam)
                          ).getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-[13px] font-bold text-slate-700 truncate">
                              {getExamTitle(exam)}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <CalendarDays size={12} />
                                {formatDate(
                                  getDate(exam)
                                )}
                              </span>

                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock3 size={12} />
                                {formatTime(
                                  exam.startTime
                                )}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`
                              shrink-0
                              inline-flex items-center gap-1.5
                              px-2.5 py-1
                              rounded-full
                              border
                              text-[9px]
                              font-bold
                              uppercase
                              ${statusStyle.badge}
                            `}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                            />
                            {status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {student?.rollNo && (
                            <span className="px-2 py-1 rounded-md bg-slate-50 text-[9px] text-slate-500 border border-slate-100">
                              Roll No. {student.rollNo}
                            </span>
                          )}

                          {student?.course && (
                            <span className="px-2 py-1 rounded-md bg-slate-50 text-[9px] text-slate-500 border border-slate-100">
                              {student.course}
                            </span>
                          )}

                          {exam.allocatedSystem && (
                            <span className="px-2 py-1 rounded-md bg-[var(--color-primary-light)] text-[9px] text-[var(--color-primary)] border border-[var(--color-border)] flex items-center gap-1">
                              <Monitor size={10} />
                              {exam.allocatedSystem}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() =>
                          navigate("/exams", {
                            state: {
                              selectedExamId:
                                exam._id,
                            },
                          })
                        }
                        className="
                          hidden sm:flex
                          w-9 h-9
                          rounded-lg
                          border border-slate-200
                          items-center justify-center
                          text-slate-400
                          hover:text-[var(--color-primary)]
                          hover:border-[var(--color-border)]
                          hover:bg-[var(--color-primary-light)]
                          transition
                        "
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-5">
          {/* Attendance summary */}
          <section className="bg-[var(--color-primary)] rounded-[22px] p-5 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full border border-white/[0.06]" />
            <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full border border-white/[0.05]" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/55">
                    Attendance
                  </p>

                  <h3 className="mt-1.5 text-lg font-bold">
                    Verification Overview
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center">
                  <ClipboardCheck size={17} />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-extrabold">
                      {stats.verified}
                    </span>

                    <span className="text-xs text-white/45 ml-2">
                      verified
                    </span>
                  </div>

                  <span className="text-[10px] text-white/50">
                    {stats.pendingAttendance} pending
                  </span>
                </div>

                <div className="h-2 mt-4 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/70 transition-all duration-500"
                    style={{
                      width:
                        stats.verified +
                          stats.pendingAttendance >
                        0
                          ? `${
                              (stats.verified /
                                (stats.verified +
                                  stats.pendingAttendance)) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate("/attendance")}
                className="
                  mt-6 w-full h-10
                  rounded-xl
                  bg-white text-[var(--color-primary)]
                  text-[11px] font-bold
                  flex items-center justify-center gap-2
                  hover:bg-[var(--color-primary-light)]
                  transition
                "
              >
                Open Attendance
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          {/* Quick actions */}
          <section className="bg-white rounded-[22px] border border-slate-200/80 p-5 shadow-[0_8px_35px_rgba(15,23,42,0.035)]">
            <h3 className="text-[14px] font-bold text-slate-800">
              Quick Actions
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Frequently used examination controls
            </p>

            <div className="mt-4 space-y-2">
              <QuickAction
                icon={ClipboardCheck}
                title="Verify Attendance"
                subtitle="Check today's candidates"
                onClick={() =>
                  navigate("/attendance")
                }
              />

              <QuickAction
                icon={Monitor}
                title="Monitor Exam"
                subtitle="View active sessions"
                onClick={() =>
                  navigate("/monitoring")
                }
              />

              <QuickAction
                icon={CalendarDays}
                title="View My Exams"
                subtitle="See all assignments"
                onClick={() =>
                  navigate("/exams")
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  live,
}) => {
  return (
    <div className="bg-white rounded-[18px] border border-slate-200/80 p-4 sm:p-5 shadow-[0_7px_28px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`
            w-9 h-9 sm:w-10 sm:h-10
            rounded-xl
            flex items-center justify-center
            ${iconBg}
          `}
        >
          <Icon
            size={18}
            className={iconColor}
            strokeWidth={2}
          />
        </div>

        {live && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--color-primary)] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Live
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl sm:text-[27px] font-extrabold tracking-[-0.03em] text-slate-800">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
};

const QuickAction = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        flex items-center gap-3
        p-3
        rounded-xl
        border border-slate-100
        bg-slate-50/50
        hover:bg-white
        hover:border-slate-200
        hover:shadow-sm
        text-left
        transition
        group
      "
    >
      <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary-light)] group-hover:border-[var(--color-border)] transition">
        <Icon
          size={16}
          className="text-[var(--color-primary)]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-700">
          {title}
        </p>

        <p className="text-[9px] text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-[var(--color-primary)] transition"
      />
    </button>
  );
};

const LoadingRows = () => {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="px-5 sm:px-6 py-5 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-[58px] h-[58px] rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-3.5 w-48 bg-slate-100 rounded" />
              <div className="h-2.5 w-32 bg-slate-100 rounded mt-2" />
              <div className="h-5 w-36 bg-slate-100 rounded mt-3" />
            </div>

            <div className="w-16 h-6 bg-slate-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="py-16 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        <CalendarDays
          size={21}
          className="text-slate-300"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-600">
        No upcoming examinations
      </h3>

      <p className="mt-1 max-w-[280px] text-[11px] leading-5 text-slate-400">
        You currently don't have any upcoming assigned
        examination sessions.
      </p>
    </div>
  );
};

export default Dashboard;