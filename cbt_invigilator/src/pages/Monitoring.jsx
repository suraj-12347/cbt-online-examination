import React, { useCallback, useEffect, useMemo, useState } from "react"; 
import { 
  AlertCircle, 
  CalendarDays, 
  CheckCircle2, 
  Clock3, 
  Computer, 
  Eye, 
  Loader2, 
  Monitor, 
  RefreshCw, 
  Search, 
  User, 
  UserCheck, 
  XCircle, 
  Activity, 
} from "lucide-react"; 
import { useLocation, useNavigate } from "react-router-dom"; 
 
import { useAuth } from "../context/AuthContext"; 
import { getAssignedExams } from "../services/invigilatorApi"; 
import { updateScheduledExamStatus } from "../services/scheduledExamApi"; 
 
const GREEN = "#0b1f3a"; 
const GREEN_LIGHT = "#173b68"; 
 
const Monitoring = () => { 
  const { invigilator } = useAuth(); 
  const location = useLocation(); 
  const navigate = useNavigate(); 
 
  const [records, setRecords] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false); 
 
  const [search, setSearch] = useState(""); 
  const [filter, setFilter] = useState("all"); 
  const [selectedExamId, setSelectedExamId] = useState( 
    location.state?.selectedExamId || "all" 
  ); 
 
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [processingId, setProcessingId] = useState(null); 
 
  const [error, setError] = useState(""); 
  const [successMessage, setSuccessMessage] = useState(""); 
 
  const loadMonitoringData = useCallback(
  async (isRefresh = false) => {
    const invigilatorId = invigilator?._id || invigilator?.id;

    if (!invigilatorId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAssignedExams(invigilatorId);

      setRecords(response?.exams || []);
    } catch (err) {
      console.error("Monitoring loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load monitoring data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [invigilator?._id, invigilator?.id]
);
 
  useEffect(() => { 
    loadMonitoringData(); 
  }, [loadMonitoringData]); 
 
  useEffect(() => { 
    if (!successMessage) return; 
 
    const timer = setTimeout(() => { 
      setSuccessMessage(""); 
    }, 3500); 
 
    return () => clearTimeout(timer); 
  }, [successMessage]); 
 
  const getExamId = (record) => { 
    if (typeof record?.examId === "object") { 
      return record.examId?._id; 
    } 
 
    return record?.examId; 
  }; 
 
  const getExamTitle = (record) => { 
    if (typeof record?.examId === "object") { 
      return record.examId?.title || "Untitled Exam"; 
    } 
 
    return "Untitled Exam"; 
  }; 
 
  const getStudentName = (record) => { 
    if (typeof record?.studentId === "object") { 
      return record.studentId?.name || "Unknown Student"; 
    } 
 
    return "Unknown Student"; 
  }; 
 
  const getStudentEmail = (record) => { 
    if (typeof record?.studentId === "object") { 
      return record.studentId?.email || ""; 
    } 
 
    return ""; 
  }; 
 
  const getRollNo = (record) => { 
    if (typeof record?.studentId === "object") { 
      return record.studentId?.rollNo || "—"; 
    } 
 
    return "—"; 
  }; 
 
  const formatDate = (value) => { 
    if (!value) return "—"; 
 
    const date = new Date(value); 
 
    if (Number.isNaN(date.getTime())) return "—"; 
 
    return date.toLocaleDateString("en-IN", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric", 
    }); 
  }; 
 
  const formatTime = (value) => { 
    if (!value) return "—"; 
 
    const date = new Date(value); 
 
    if (Number.isNaN(date.getTime())) return "—"; 
 
    return date.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true, 
    }); 
  }; 
 
  const getDurationText = (start, end) => { 
    if (!start || !end) return "—"; 
 
    const startDate = new Date(start); 
    const endDate = new Date(end); 
 
    if ( 
      Number.isNaN(startDate.getTime()) || 
      Number.isNaN(endDate.getTime()) 
    ) { 
      return "—"; 
    } 
 
    const minutes = Math.max( 
      0, 
      Math.round((endDate - startDate) / 60000) 
    ); 
 
    if (minutes < 60) { 
      return `${minutes} min`; 
    } 
 
    const hours = Math.floor(minutes / 60); 
    const remaining = minutes % 60; 
 
    return remaining 
      ? `${hours}h ${remaining}m` 
      : `${hours}h`; 
  }; 
 
  const stats = useMemo(() => { 
    const active = records.filter( 
      (item) => item.status === "active" 
    ).length; 
 
    const scheduled = records.filter( 
      (item) => item.status === "scheduled" 
    ).length; 
 
    const completed = records.filter( 
      (item) => item.status === "completed" 
    ).length; 
 
    const verified = records.filter( 
      (item) => item.attendanceStatus === "verified" 
    ).length; 
 
    return { 
      total: records.length, 
      active, 
      scheduled, 
      completed, 
      verified, 
    }; 
  }, [records]); 
 
  const filteredRecords = useMemo(() => { 
    const query = search.trim().toLowerCase(); 
 
    return records.filter((record) => { 
      const examId = getExamId(record); 
      const status = record.status || "scheduled"; 
 
      const matchesSelectedExam = 
        selectedExamId === "all" || 
        examId === selectedExamId; 
 
      const matchesFilter = 
        filter === "all" || status === filter; 
 
      const searchableText = [ 
        getExamTitle(record), 
        getStudentName(record), 
        getStudentEmail(record), 
        getRollNo(record), 
        record.allocatedSystem || "", 
      ] 
        .join(" ") 
        .toLowerCase(); 
 
      const matchesSearch = 
        !query || searchableText.includes(query); 
 
      return ( 
        matchesSelectedExam && 
        matchesFilter && 
        matchesSearch 
      ); 
    }); 
  }, [records, search, filter, selectedExamId]); 
 
  const activeRecords = filteredRecords.filter( 
    (item) => item.status === "active" 
  ); 
 
  const handleStatusChange = async (record, status) => { 
    if (!record?._id) return; 
 
    try { 
      setProcessingId(record._id); 
      setError(""); 
 
      await updateScheduledExamStatus( 
        record._id, 
        status 
      ); 
 
      setRecords((previous) => 
        previous.map((item) => 
          item._id === record._id 
            ? { 
                ...item, 
                status, 
              } 
            : item 
        ) 
      ); 
 
      setSelectedRecord((previous) => 
        previous?._id === record._id 
          ? { 
              ...previous, 
              status, 
            } 
          : previous 
      ); 
 
      setSuccessMessage( 
        `Exam status updated to ${status}.` 
      ); 
    } catch (err) { 
      console.error("Status update error:", err); 
 
      setError( 
        err?.response?.data?.message || 
          err?.message || 
          "Unable to update exam status." 
      ); 
    } finally { 
      setProcessingId(null); 
    } 
  }; 
 
  const getStatusBadge = (status) => { 
    if (status === "active") { 
      return ( 
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"> 
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 
          Live 
        </span> 
      ); 
    } 
 
    if (status === "completed") { 
      return ( 
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"> 
          <CheckCircle2 size={13} /> 
          Completed 
        </span> 
      ); 
    } 
 
    if (status === "cancelled") { 
      return ( 
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"> 
          <XCircle size={13} /> 
          Cancelled 
        </span> 
      ); 
    } 
 
    if (status === "absent") { 
      return ( 
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"> 
          <UserXIcon /> 
          Absent 
        </span> 
      ); 
    } 
 
    return ( 
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"> 
        <Clock3 size={13} /> 
        Scheduled 
      </span> 
    ); 
  }; 
 
  if (loading) { 
    return ( 
      <div className="page-enter space-y-6"> 
        <div className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-white" /> 
 
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"> 
          {Array.from({ length: 4 }).map((_, index) => ( 
            <div 
              key={index} 
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" 
            /> 
          ))} 
        </div> 
 
        <div className="h-[480px] animate-pulse rounded-[28px] border border-slate-200 bg-white" /> 
      </div> 
    ); 
  } 
 
  return ( 
    <div className="page-enter space-y-6"> 
      {/* Hero */} 
      <section 
        className="relative overflow-hidden rounded-[30px] p-6 sm:p-8" 
        style={{ backgroundColor: GREEN }} 
      > 
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" /> 
        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" /> 
 
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"> 
          <div> 
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80"> 
              <Activity size={14} /> 
              Examination Control 
            </div> 
 
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl"> 
              Live Monitoring 
            </h1> 
 
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70"> 
              Monitor your assigned CBT candidates, 
              examination status and allocated systems from 
              one place. 
            </p> 
          </div> 
 
          <button 
            type="button" 
            onClick={() => loadMonitoringData(true)} 
            disabled={refreshing} 
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60" 
          > 
            <RefreshCw 
              size={16} 
              className={ 
                refreshing ? "animate-spin" : "" 
              } 
            /> 
            Refresh 
          </button> 
        </div> 
      </section> 
 
      {/* Alerts */} 
      {error && ( 
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"> 
          <AlertCircle 
            size={18} 
            className="mt-0.5 shrink-0" 
          /> 
 
          <span className="flex-1">{error}</span> 
 
          <button 
            type="button" 
            onClick={() => setError("")} 
            className="rounded-lg p-1 hover:bg-red-100" 
          > 
            <XCircle size={16} /> 
          </button> 
        </div> 
      )} 
 
      {successMessage && ( 
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700"> 
          <CheckCircle2 size={18} /> 
          {successMessage} 
        </div> 
      )} 
 
      {/* Stats */} 
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"> 
        <MonitoringStat 
          icon={Monitor} 
          label="Total Candidates" 
          value={stats.total} 
          description="Assigned examinations" 
        /> 
 
        <MonitoringStat 
          icon={Activity} 
          label="Live Now" 
          value={stats.active} 
          description="Currently active" 
          iconClass="bg-emerald-50 text-emerald-700" 
        /> 
 
        <MonitoringStat 
          icon={Clock3} 
          label="Scheduled" 
          value={stats.scheduled} 
          description="Upcoming candidates" 
          iconClass="bg-amber-50 text-amber-700" 
        /> 
 
        <MonitoringStat 
          icon={CheckCircle2} 
          label="Completed" 
          value={stats.completed} 
          description="Finished examinations" 
          iconClass="bg-blue-50 text-blue-700" 
        /> 
      </div> 
 
      {/* Live panel */} 
      {activeRecords.length > 0 && ( 
        <section 
          className="overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6" 
        > 
          <div className="flex items-center gap-3"> 
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"> 
              <Activity size={19} /> 
            </div> 
 
            <div> 
              <h2 className="text-base font-bold text-slate-900"> 
                Active Examinations 
              </h2> 
 
              <p className="mt-0.5 text-xs text-slate-500"> 
                {activeRecords.length} candidate 
                {activeRecords.length !== 1 ? "s" : ""}{" "} 
                currently marked as active 
              </p> 
            </div> 
          </div> 
 
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"> 
            {activeRecords.slice(0, 6).map((record) => ( 
              <LiveCard 
                key={record._id} 
                record={record} 
                getExamTitle={getExamTitle} 
                getStudentName={getStudentName} 
                getRollNo={getRollNo} 
                formatTime={formatTime} 
                getDurationText={getDurationText} 
                onView={() => setSelectedRecord(record)} 
              /> 
            ))} 
          </div> 
        </section> 
      )} 
 
      {/* Filters */} 
      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"> 
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center"> 
          <div className="relative min-w-0 flex-1"> 
            <Search 
              size={17} 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" 
            /> 
 
            <input 
              value={search} 
              onChange={(event) => 
                setSearch(event.target.value) 
              } 
              placeholder="Search candidate, exam, roll number or system..." 
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#0b1f3a] focus:bg-white" 
            /> 
          </div> 
 
          <div className="relative"> 
            <select 
              value={filter} 
              onChange={(event) => 
                setFilter(event.target.value) 
              } 
              className="h-11 min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-9 text-sm font-medium text-slate-600 focus:border-[#0b1f3a]" 
            > 
              <option value="all">All Status</option> 
              <option value="active">Active</option> 
              <option value="scheduled">Scheduled</option> 
              <option value="completed">Completed</option> 
              <option value="cancelled">Cancelled</option> 
              <option value="absent">Absent</option> 
            </select> 
          </div> 
 
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
      </section> 
 
      {/* Monitoring list */} 
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"> 
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"> 
          <div> 
            <h2 className="text-base font-bold text-slate-900"> 
              Examination Monitor 
            </h2> 
 
            <p className="mt-1 text-xs text-slate-500"> 
              {filteredRecords.length} records available 
            </p> 
          </div> 
 
          <div className="flex items-center gap-2 text-xs text-slate-400"> 
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 
            Live status updates 
          </div> 
        </div> 
 
        {filteredRecords.length === 0 ? ( 
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center"> 
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"> 
              <Monitor size={24} /> 
            </div> 
 
            <h3 className="mt-4 text-sm font-bold text-slate-800"> 
              No examinations found 
            </h3> 
 
            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400"> 
              Try changing your search or status filter. 
            </p> 
          </div> 
        ) : ( 
          <> 
            <div className="hidden overflow-x-auto lg:block"> 
              <table className="w-full min-w-[1050px]"> 
                <thead> 
                  <tr className="border-b border-slate-100 bg-slate-50/70"> 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Candidate 
                    </th> 
 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Examination 
                    </th> 
 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Timing 
                    </th> 
 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Attendance 
                    </th> 
 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      System 
                    </th> 
 
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Status 
                    </th> 
 
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500"> 
                      Action 
                    </th> 
                  </tr> 
                </thead> 
 
                <tbody className="divide-y divide-slate-100"> 
                  {filteredRecords.map((record) => ( 
                    <MonitoringRow 
                      key={record._id} 
                      record={record} 
                      processingId={processingId} 
                      onView={() => 
                        setSelectedRecord(record) 
                      } 
                      onStatusChange={ 
                        handleStatusChange 
                      } 
                      getExamTitle={getExamTitle} 
                      getStudentName={getStudentName} 
                      getRollNo={getRollNo} 
                      getAttendanceStatus={(item) => 
                        item.attendanceStatus || "pending" 
                      } 
                      getStatusBadge={getStatusBadge} 
                      formatDate={formatDate} 
                      formatTime={formatTime} 
                    /> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
 
            <div className="divide-y divide-slate-100 lg:hidden"> 
              {filteredRecords.map((record) => ( 
                <MonitoringMobileCard 
                  key={record._id} 
                  record={record} 
                  processingId={processingId} 
                  onView={() => 
                    setSelectedRecord(record) 
                  } 
                  onStatusChange={ 
                    handleStatusChange 
                  } 
                  getExamTitle={getExamTitle} 
                  getStudentName={getStudentName} 
                  getStudentEmail={getStudentEmail} 
                  getRollNo={getRollNo} 
                  getAttendanceStatus={(item) => 
                    item.attendanceStatus || "pending" 
                  } 
                  getStatusBadge={getStatusBadge} 
                  formatDate={formatDate} 
                  formatTime={formatTime} 
                /> 
              ))} 
            </div> 
          </> 
        )} 
      </section> 
 
      {/* Details modal */} 
      {selectedRecord && ( 
        <MonitoringModal 
          record={selectedRecord} 
          processingId={processingId} 
          onClose={() => setSelectedRecord(null)} 
          onStatusChange={handleStatusChange} 
          getExamTitle={getExamTitle} 
          getStudentName={getStudentName} 
          getStudentEmail={getStudentEmail} 
          getRollNo={getRollNo} 
          getStatusBadge={getStatusBadge} 
          formatDate={formatDate} 
          formatTime={formatTime} 
          getDurationText={getDurationText} 
          navigate={navigate} 
        /> 
      )} 
    </div> 
  ); 
}; 
 
const MonitoringStat = ({ 
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
 
const LiveCard = ({ 
  record, 
  getExamTitle, 
  getStudentName, 
  getRollNo, 
  formatTime, 
  getDurationText, 
  onView, 
}) => ( 
  <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"> 
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
 
          <p className="text-[11px] text-slate-400"> 
            Roll No: {getRollNo(record)} 
          </p> 
        </div> 
      </div> 
 
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"> 
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 
        LIVE 
      </span> 
    </div> 
 
    <div className="mt-4 rounded-xl bg-slate-50 p-3"> 
      <p className="truncate text-xs font-bold text-slate-700"> 
        {getExamTitle(record)} 
      </p> 
 
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400"> 
        <span> 
          {formatTime(record.startTime)} –{" "} 
          {formatTime(record.endTime)} 
        </span> 
 
        <span> 
          {getDurationText( 
            record.startTime, 
            record.endTime 
          )} 
        </span> 
      </div> 
    </div> 
 
    <div className="mt-3 flex items-center justify-between"> 
      <div className="flex items-center gap-1.5 text-xs text-slate-500"> 
        <Computer size={14} /> 
        {record.allocatedSystem || "No system"} 
      </div> 
 
      <button 
        type="button" 
        onClick={onView} 
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0b1f3a] hover:bg-blue-50" 
      > 
        <Eye size={13} /> 
        View 
      </button> 
    </div> 
  </div> 
); 
 
const MonitoringRow = ({ 
  record, 
  processingId, 
  onView, 
  onStatusChange, 
  getExamTitle, 
  getStudentName, 
  getRollNo, 
  getAttendanceStatus, 
  getStatusBadge, 
  formatDate, 
  formatTime, 
}) => { 
  const isProcessing = processingId === record._id; 
 
  return ( 
    <tr className="align-top hover:bg-slate-50/60"> 
      <td className="px-5 py-4"> 
        <div className="flex items-center gap-3"> 
          <Avatar 
            name={getStudentName(record)} 
            image={record?.studentId?.image} 
          /> 
 
          <div> 
            <p className="text-sm font-bold text-slate-800"> 
              {getStudentName(record)} 
            </p> 
 
            <p className="mt-0.5 text-[11px] text-slate-400"> 
              Roll No: {getRollNo(record)} 
            </p> 
          </div> 
        </div> 
      </td> 
 
      <td className="px-5 py-4"> 
        <p className="max-w-[200px] text-sm font-semibold text-slate-700"> 
          {getExamTitle(record)} 
        </p> 
      </td> 
 
      <td className="px-5 py-4"> 
        <p className="text-xs font-semibold text-slate-700"> 
          {formatDate(record.examDate)} 
        </p> 
 
        <p className="mt-1 text-[11px] text-slate-400"> 
          {formatTime(record.startTime)} –{" "} 
          {formatTime(record.endTime)} 
        </p> 
      </td> 
 
      <td className="px-5 py-4"> 
        <AttendanceBadge 
          status={getAttendanceStatus(record)} 
        /> 
      </td> 
 
      <td className="px-5 py-4"> 
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2"> 
          <Computer 
            size={14} 
            className="text-slate-500" 
          /> 
 
          <span className="text-xs font-semibold text-slate-600"> 
            {record.allocatedSystem || "Not allocated"} 
          </span> 
        </div> 
      </td> 
 
      <td className="px-5 py-4"> 
        {getStatusBadge(record.status)} 
      </td> 
 
      <td className="px-5 py-4"> 
        <div className="flex justify-end gap-2"> 
          <button 
            type="button" 
            onClick={onView} 
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50" 
          > 
            <Eye size={13} /> 
            View 
          </button> 
 
          {record.status === "scheduled" && 
            record.attendanceStatus === "verified" && ( 
              <button 
                type="button" 
                disabled={isProcessing} 
                onClick={() => 
                  onStatusChange(record, "active") 
                } 
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b1f3a] px-3 text-xs font-semibold text-white hover:bg-[#07172c] disabled:opacity-50" 
              > 
                {isProcessing ? ( 
                  <Loader2 
                    size={13} 
                    className="animate-spin" 
                  /> 
                ) : ( 
                  <Activity size={13} /> 
                )} 
                Start 
              </button> 
            )} 
 
          {record.status === "active" && ( 
            <button 
              type="button" 
              disabled={isProcessing} 
              onClick={() => 
                onStatusChange(record, "completed") 
              } 
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50" 
            > 
              {isProcessing ? ( 
                <Loader2 
                  size={13} 
                  className="animate-spin" 
                /> 
              ) : ( 
                <CheckCircle2 size={13} /> 
              )} 
              Finish 
            </button> 
          )} 
        </div> 
      </td> 
    </tr> 
  ); 
}; 
 
const MonitoringMobileCard = ({ 
  record, 
  processingId, 
  onView, 
  onStatusChange, 
  getExamTitle, 
  getStudentName, 
  getStudentEmail, 
  getRollNo, 
  getAttendanceStatus, 
  getStatusBadge, 
  formatDate, 
  formatTime, 
}) => { 
  const isProcessing = processingId === record._id; 
 
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
 
            <p className="text-[11px] text-slate-400"> 
              Roll No: {getRollNo(record)} 
            </p> 
 
            <p className="truncate text-[11px] text-slate-400"> 
              {getStudentEmail(record)} 
            </p> 
          </div> 
        </div> 
 
        {getStatusBadge(record.status)} 
      </div> 
 
      <div className="mt-4 rounded-2xl bg-slate-50 p-4"> 
        <p className="text-xs font-bold text-slate-800"> 
          {getExamTitle(record)} 
        </p> 
 
        <div className="mt-3 grid grid-cols-2 gap-3"> 
          <InfoItem 
            icon={CalendarDays} 
            label="Date" 
            value={formatDate(record.examDate)} 
          /> 
 
          <InfoItem 
            icon={Clock3} 
            label="Time" 
            value={`${formatTime( 
              record.startTime 
            )} – ${formatTime(record.endTime)}`} 
          /> 
 
          <InfoItem 
            icon={UserCheck} 
            label="Attendance" 
            value={ 
              <AttendanceBadge 
                status={getAttendanceStatus(record)} 
              /> 
            } 
          /> 
 
          <InfoItem 
            icon={Computer} 
            label="System" 
            value={ 
              record.allocatedSystem || "Not allocated" 
            } 
          /> 
        </div> 
      </div> 
 
      <div className="mt-4 grid grid-cols-2 gap-2"> 
        <button 
          type="button" 
          onClick={onView} 
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600" 
        > 
          <Eye size={14} /> 
          View Details 
        </button> 
 
        {record.status === "scheduled" && 
        record.attendanceStatus === "verified" ? ( 
          <button 
            type="button" 
            disabled={isProcessing} 
            onClick={() => 
              onStatusChange(record, "active") 
            } 
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0b1f3a] text-xs font-semibold text-white hover:bg-[#07172c] disabled:opacity-50" 
          > 
            {isProcessing ? ( 
              <Loader2 
                size={14} 
                className="animate-spin" 
              /> 
            ) : ( 
              <Activity size={14} /> 
            )} 
            Start Exam 
          </button> 
        ) : record.status === "active" ? ( 
          <button 
            type="button" 
            disabled={isProcessing} 
            onClick={() => 
              onStatusChange(record, "completed") 
            } 
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50" 
          > 
            {isProcessing ? ( 
              <Loader2 
                size={14} 
                className="animate-spin" 
              /> 
            ) : ( 
              <CheckCircle2 size={14} /> 
            )} 
            Finish Exam 
          </button> 
        ) : ( 
          <div className="flex h-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-medium text-slate-400"> 
            No action 
          </div> 
        )} 
      </div> 
    </div> 
  ); 
}; 
 
const MonitoringModal = ({ 
  record, 
  processingId, 
  onClose, 
  onStatusChange, 
  getExamTitle, 
  getStudentName, 
  getStudentEmail, 
  getRollNo, 
  getStatusBadge, 
  formatDate, 
  formatTime, 
  getDurationText, 
  navigate, 
}) => { 
  const isProcessing = processingId === record._id; 
 
  return ( 
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" 
      onMouseDown={(event) => { 
        if (event.target === event.currentTarget) { 
          onClose(); 
        } 
      }} 
    > 
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"> 
        <div 
          className="relative overflow-hidden rounded-t-[28px] p-6" 
          style={{ backgroundColor: GREEN }} 
        > 
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/5" /> 
 
          <div className="relative z-10 flex items-start justify-between gap-4"> 
            <div> 
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80"> 
                <Monitor size={12} /> 
                Candidate Monitoring 
              </div> 
 
              <h2 className="text-xl font-bold text-white"> 
                {getStudentName(record)} 
              </h2> 
 
              <p className="mt-1 text-xs text-white/70"> 
                {getExamTitle(record)} 
              </p> 
            </div> 
 
            <button 
              type="button" 
              onClick={onClose} 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/15" 
            > 
              <XCircle size={18} /> 
            </button> 
          </div> 
        </div> 
 
        <div className="p-5 sm:p-6"> 
          <div className="grid gap-4 sm:grid-cols-2"> 
            <DetailBox 
              icon={User} 
              label="Candidate" 
              value={getStudentName(record)} 
            /> 
 
            <DetailBox 
              icon={UserCheck} 
              label="Roll Number" 
              value={getRollNo(record)} 
            /> 
 
            <DetailBox 
              icon={CalendarDays} 
              label="Exam Date" 
              value={formatDate(record.examDate)} 
            /> 
 
            <DetailBox 
              icon={Clock3} 
              label="Exam Time" 
              value={`${formatTime( 
                record.startTime 
              )} – ${formatTime(record.endTime)}`} 
            /> 
 
            <DetailBox 
              icon={Clock3} 
              label="Duration" 
              value={getDurationText( 
                record.startTime, 
                record.endTime 
              )} 
            /> 
 
            <DetailBox 
              icon={Computer} 
              label="Allocated System" 
              value={ 
                record.allocatedSystem || 
                "Not allocated" 
              } 
            /> 
          </div> 
 
          <div className="mt-5 rounded-2xl border border-slate-200 p-4"> 
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400"> 
              Current Status 
            </p> 
 
            <div className="mt-3 flex flex-wrap items-center gap-3"> 
              {getStatusBadge(record.status)} 
 
              <AttendanceBadge 
                status={ 
                  record.attendanceStatus || "pending" 
                } 
              /> 
 
              {record.accessGranted && ( 
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"> 
                  <CheckCircle2 size={13} /> 
                  Access Granted 
                </span> 
              )} 
            </div> 
          </div> 
 
          {getStudentEmail(record) && ( 
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3"> 
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400"> 
                Candidate Email 
              </p> 
 
              <p className="mt-1 text-sm font-medium text-slate-700"> 
                {getStudentEmail(record)} 
              </p> 
            </div> 
          )} 
 
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end"> 
            <button 
              type="button" 
              onClick={() => { 
                onClose(); 
 
                navigate("/attendance", { 
                  state: { 
                    selectedExamId: 
                      typeof record.examId === "object" 
                        ? record.examId?._id 
                        : record.examId, 
                  }, 
                }); 
              }} 
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50" 
            > 
              Manage Attendance 
            </button> 
 
            {record.status === "scheduled" && 
              record.attendanceStatus === "verified" && ( 
                <button 
                  type="button" 
                  disabled={isProcessing} 
                  onClick={() => 
                    onStatusChange(record, "active") 
                  } 
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b1f3a] px-4 text-xs font-semibold text-white hover:bg-[#07172c] disabled:opacity-50" 
                > 
                  {isProcessing ? ( 
                    <Loader2 
                      size={14} 
                      className="animate-spin" 
                    /> 
                  ) : ( 
                    <Activity size={14} /> 
                  )} 
                  Start Examination 
                </button> 
              )} 
 
            {record.status === "active" && ( 
              <button 
                type="button" 
                disabled={isProcessing} 
                onClick={() => 
                  onStatusChange(record, "completed") 
                } 
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50" 
              > 
                {isProcessing ? ( 
                  <Loader2 
                    size={14} 
                    className="animate-spin" 
                  /> 
                ) : ( 
                  <CheckCircle2 size={14} /> 
                )} 
                Complete Examination 
              </button> 
            )} 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
const DetailBox = ({ 
  icon: Icon, 
  label, 
  value, 
}) => ( 
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"> 
    <div className="flex items-center gap-2 text-slate-400"> 
      <Icon size={14} /> 
      <span className="text-[10px] font-bold uppercase tracking-wider"> 
        {label} 
      </span> 
    </div> 
 
    <p className="mt-2 truncate text-sm font-semibold text-slate-700"> 
      {value} 
    </p> 
  </div> 
); 
 
const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
}) => ( 
  <div> 
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400"> 
      <Icon size={11} /> 
      {label} 
    </div> 
 
    <div className="mt-1 text-xs font-semibold text-slate-700"> 
      {value} 
    </div> 
  </div> 
); 
 
const AttendanceBadge = ({ status }) => { 
  if (status === "verified") { 
    return ( 
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"> 
        <CheckCircle2 size={11} /> 
        Verified 
      </span> 
    ); 
  } 
 
  if (status === "absent") { 
    return ( 
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700"> 
        <XCircle size={11} /> 
        Absent 
      </span> 
    ); 
  } 
 
  return ( 
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700"> 
      <Clock3 size={11} /> 
      Pending 
    </span> 
  ); 
}; 
 
const Avatar = ({ name, image }) => { 
  const initials = 
    name 
      ?.split(" ") 
      .filter(Boolean) 
      .slice(0, 2) 
      .map((part) => part[0]) 
      .join("") 
      .toUpperCase() || "ST"; 
 
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
      style={{ backgroundColor: GREEN_LIGHT }} 
    > 
      {initials} 
    </div> 
  ); 
}; 
 
const UserXIcon = () => ( 
  <svg 
    width="13" 
    height="13" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  > 
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> 
    <circle cx="9" cy="7" r="4" /> 
    <line x1="17" y1="8" x2="22" y2="13" /> 
    <line x1="22" y1="8" x2="17" y2="13" /> 
  </svg> 
); 
 
export default Monitoring;