
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  Cpu,
  Edit3,
  HardDrive,
  LoaderCircle,
  MapPin,
  Monitor,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import {
  getAllSystems,
  createSystem,
  updateSystem,
  allocateSystemToExam,
  releaseSystem,
  deleteSystem,
} from "../services/systemApi";

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

const getSystemId = (system) => system?._id || system?.id;

const getSystemStatus = (system) =>
  String(system?.status || "available").toLowerCase();

const getExamId = (system) => {
  const exam = system?.currentScheduledExam;

  return typeof exam === "object" && exam !== null
    ? exam._id || exam.id
    : exam;
};

const getRole = (user) => {
  const raw =
    user?.role ||
    user?.userRole ||
    user?.user?.role ||
    user?.invigilator?.role ||
    user?.operator?.role ||
    user?.admin?.role ||
    "";

  const role = String(raw).toLowerCase().replace(/[\s_-]/g, "");

  if (role.includes("admin")) return "admin";
  if (role.includes("operator")) return "operator";
  if (role.includes("invigilator")) return "invigilator";

  return role || "viewer";
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const emptyForm = {
  name: "",
  systemNumber: "",
  labName: "",
  ipAddress: "",
  macAddress: "",
  notes: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

// -----------------------------------------------------
// Status Badge
// -----------------------------------------------------

const SystemStatusBadge = ({ status }) => {
  const styles = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    occupied: "bg-blue-50 text-blue-700 border-blue-200",
    maintenance: "bg-amber-50 text-amber-700 border-amber-200",
    inactive: "bg-gray-100 text-gray-600 border-gray-200",
    unavailable: "bg-red-50 text-red-700 border-red-200",
  };

  const icons = {
    available: CheckCircle2,
    occupied: Monitor,
    maintenance: Activity,
    inactive: X,
    unavailable: AlertCircle,
  };

  const Icon = icons[status] || Activity;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        styles[status] || styles.inactive
      }`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

// -----------------------------------------------------
// Stat Card
// -----------------------------------------------------

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color] || colors.green}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// Add System Modal
// -----------------------------------------------------

const SystemModal = ({ onClose, onSave, saving }) => {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("System name is required.");
      return;
    }

    if (
      form.systemNumber.trim() === "" ||
      !Number.isFinite(Number(form.systemNumber)) ||
      Number(form.systemNumber) < 0
    ) {
      setFormError("Enter a valid system number.");
      return;
    }

    try {
      await onSave({
        name: form.name.trim(),
        systemNumber: Number(form.systemNumber),
        labName: form.labName.trim(),
        ipAddress: form.ipAddress.trim(),
        macAddress: form.macAddress.trim(),
        notes: form.notes.trim(),
      });
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not create the system.")
      );
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#103d2b] to-[#176044] p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <Server size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold">Add New System</h2>
              <p className="mt-1 text-xs text-emerald-100">
                Register a computer in your examination lab.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                System Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. LAB-01-PC"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                System Number *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                name="systemNumber"
                value={form.systemNumber}
                onChange={handleChange}
                placeholder="e.g. 1"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                Lab Name
              </label>
              <input
                name="labName"
                value={form.labName}
                onChange={handleChange}
                placeholder="e.g. Computer Lab A"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                IP Address
              </label>
              <input
                name="ipAddress"
                value={form.ipAddress}
                onChange={handleChange}
                placeholder="e.g. 192.168.1.10"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                MAC Address
              </label>
              <input
                name="macAddress"
                value={form.macAddress}
                onChange={handleChange}
                placeholder="Optional"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Computer configuration or additional information"
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {saving ? "Creating..." : "Create System"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// Allocate System Modal
// -----------------------------------------------------

const AllocateModal = ({ system, onClose, onAllocate, saving }) => {
  const [scheduledExamId, setScheduledExamId] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!scheduledExamId.trim()) {
      setFormError("Scheduled exam ID is required.");
      return;
    }

    try {
      await onAllocate(getSystemId(system), scheduledExamId.trim());
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not allocate this system.")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#103d2b] p-5 text-white">
          <div>
            <h2 className="font-bold">Allocate System</h2>
            <p className="mt-1 text-xs text-emerald-100">
              {system.name} · System #{system.systemNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close allocation modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            Only allocate a system after the candidate's attendance has
            been verified. Enter the ScheduledExam document ID.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              Scheduled Exam ID *
            </label>
            <input
              value={scheduledExamId}
              onChange={(event) => setScheduledExamId(event.target.value)}
              placeholder="Paste ScheduledExam MongoDB ID"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving && (
                <LoaderCircle size={15} className="animate-spin" />
              )}
              Allocate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// Main System Page
// -----------------------------------------------------

const SystemPage = ({ userRole: suppliedRole }) => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [labFilter, setLabFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  const role = useMemo(() => {
    if (suppliedRole) return getRole({ role: suppliedRole });
    return getRole(getStoredUser());
  }, [suppliedRole]);

//   const canManage = role === "admin" || role === "operator";
const canManage = 1;

  const loadSystems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getAllSystems();
      const data = response?.data ?? response;

      const list = Array.isArray(data?.systems)
        ? data.systems
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setSystems(list);
    } catch (error) {
      console.error("Load systems failed:", error);

      setNotice({
        type: "error",
        message: getErrorMessage(
          error,
          "Could not load systems. Please check the API and server."
        ),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const labs = useMemo(
    () =>
      [...new Set(systems.map((system) => system.labName).filter(Boolean))].sort(),
    [systems]
  );

  const totals = useMemo(
    () => ({
      total: systems.length,
      available: systems.filter(
        (system) => getSystemStatus(system) === "available"
      ).length,
      occupied: systems.filter(
        (system) => getSystemStatus(system) === "occupied"
      ).length,
      maintenance: systems.filter((system) =>
        ["maintenance", "inactive", "unavailable"].includes(
          getSystemStatus(system)
        )
      ).length,
    }),
    [systems]
  );

  const filteredSystems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return systems
      .filter((system) => {
        const status = getSystemStatus(system);

        const matchesStatus =
          statusFilter === "all" || status === statusFilter;

        const matchesLab =
          labFilter === "all" || system.labName === labFilter;

        const matchesSearch =
          !query ||
          [
            system.name,
            system.systemNumber,
            system.labName,
            system.ipAddress,
            system.macAddress,
            system.notes,
          ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
          );

        return matchesStatus && matchesLab && matchesSearch;
      })
      .sort((a, b) => {
        const order = {
          available: 0,
          occupied: 1,
          maintenance: 2,
          inactive: 3,
          unavailable: 4,
        };

        const difference =
          (order[getSystemStatus(a)] ?? 5) -
          (order[getSystemStatus(b)] ?? 5);

        return difference || Number(a.systemNumber) - Number(b.systemNumber);
      });
  }, [systems, search, statusFilter, labFilter]);

  // Create system
  const handleCreate = async (formData) => {
    if (!canManage) {
      throw new Error("You do not have permission to add systems.");
    }

    setSaving(true);
    setNotice(null);

    try {
      const response = await createSystem(formData);
      const result = response?.data ?? response;

      if (result?.success === false) {
        throw new Error(result.message || "Could not create system.");
      }

      setShowCreateModal(false);
      setNotice({
        type: "success",
        message: result?.message || "New system created successfully.",
      });

      await loadSystems(true);
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Could not create system."),
      });

      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Allocate system
  const handleAllocate = async (systemId, scheduledExamId) => {
    setSaving(true);

    try {
      await allocateSystemToExam(systemId, scheduledExamId);
      setAllocateTarget(null);

      setNotice({
        type: "success",
        message: "System allocated successfully.",
      });

      await loadSystems(true);
    } finally {
      setSaving(false);
    }
  };

  // Release system
  const handleRelease = async (system) => {
    if (!canManage) return;

    if (!window.confirm(`Release ${system.name} and make it available?`)) {
      return;
    }

    const id = getSystemId(system);
    setBusyId(id);

    try {
      await releaseSystem(id);

      setNotice({
        type: "success",
        message: `${system.name} has been released successfully.`,
      });

      await loadSystems(true);
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Could not release system."),
      });
    } finally {
      setBusyId(null);
    }
  };

  // Maintenance status
  const handleToggleMaintenance = async (system) => {
    if (!canManage) return;

    const id = getSystemId(system);
    const status = getSystemStatus(system);

    if (status === "occupied" || system.currentScheduledExam) {
      setNotice({
        type: "error",
        message: "Release the allocated system before changing its status.",
      });
      return;
    }

    const nextStatus =
      status === "maintenance" ? "available" : "maintenance";

    setBusyId(id);

    try {
      await updateSystem(id, { status: nextStatus });

      setNotice({
        type: "success",
        message: `${system.name} status changed to ${nextStatus}.`,
      });

      await loadSystems(true);
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Could not update system status."),
      });
    } finally {
      setBusyId(null);
    }
  };

  // Delete system
  const handleDelete = async (system) => {
    if (!canManage) return;

    if (!window.confirm(`Delete ${system.name}? This action cannot be undone.`)) {
      return;
    }

    const id = getSystemId(system);
    setBusyId(id);

    try {
      await deleteSystem(id);

      setSystems((current) =>
        current.filter((item) => getSystemId(item) !== id)
      );

      setNotice({
        type: "success",
        message: `${system.name} deleted successfully.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Could not delete system."),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 p-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            <Cpu size={16} />
            Examination Infrastructure
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            System Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor lab computers, system availability and exam allocations.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
            <UserRound size={14} />
            Signed-in role:
            <span className="capitalize text-gray-900">{role}</span>
          </div>
        </div>

        {/* Buttons: Add System is beside Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadSystems(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus size={17} />
              Add New System
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notice && (
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
            className="ml-auto"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="Total Systems" value={totals.total} icon={Server} color="gray" />
        <StatCard title="Available" value={totals.available} icon={CheckCircle2} color="green" />
        <StatCard title="Occupied" value={totals.occupied} icon={Monitor} color="blue" />
        <StatCard title="Maintenance / Offline" value={totals.maintenance} icon={Activity} color="amber" />
      </div>

      {/* Systems List */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold text-gray-900">Computer Systems</h2>
            <p className="mt-1 text-xs text-gray-500">
              Search computers by name, number, lab or network address.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {filteredSystems.length} systems
          </span>
        </div>

        {/* Search & Filters */}
        <div className="grid gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search system, lab or IP address..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter systems by status"
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <select
            value={labFilter}
            onChange={(event) => setLabFilter(event.target.value)}
            aria-label="Filter systems by lab"
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All laboratories</option>
            {labs.map((lab) => (
              <option key={lab} value={lab}>{lab}</option>
            ))}
          </select>
        </div>

        {/* Loading / Empty / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoaderCircle size={32} className="animate-spin text-emerald-700" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              Loading computer systems...
            </p>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <HardDrive size={28} />
            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              {systems.length === 0 ? "No systems registered" : "No matching systems"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {systems.length === 0
                ? canManage
                  ? "Add your first computer system to get started."
                  : "No computer systems are currently registered."
                : "Try changing the search text or filters."}
            </p>

            {canManage && systems.length === 0 && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                <Plus size={16} />
                Add First System
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">System</th>
                    <th className="px-5 py-4">Laboratory</th>
                    <th className="px-5 py-4">Network</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Current Assignment</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredSystems.map((system) => {
                    const id = getSystemId(system);
                    const status = getSystemStatus(system);
                    const occupied =
                      status === "occupied" ||
                      Boolean(system.currentScheduledExam);
                    const currentExam = system.currentScheduledExam;

                    return (
                      <tr key={id} className="transition hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              status === "available"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "occupied"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              <Monitor size={19} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-gray-900">{system.name}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                System #{system.systemNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin size={15} className="text-gray-400" />
                            {system.labName || "Not assigned"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Network size={14} className="text-gray-400" />
                            {system.ipAddress || "No IP"}
                          </div>
                          {system.macAddress && (
                            <p className="mt-1 text-[10px] text-gray-400">
                              {system.macAddress}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <SystemStatusBadge status={status} />
                        </td>

                        <td className="px-5 py-4">
                          {occupied ? (
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {currentExam?.examId?.title ||
                                  currentExam?.examTitle ||
                                  "Exam allocation"}
                              </p>
                              <p className="mt-1 break-all text-[10px] text-gray-400">
                                {getExamId(system) || "Assignment active"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No active assignment
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canManage && status === "available" && (
                              <button
                                type="button"
                                title="Allocate system"
                                onClick={() => setAllocateTarget(system)}
                                className="rounded-lg border border-blue-200 p-2 text-blue-700 hover:bg-blue-50"
                              >
                                <Zap size={15} />
                              </button>
                            )}

                            {canManage && occupied && (
                              <button
                                type="button"
                                title="Release system"
                                disabled={busyId === id}
                                onClick={() => handleRelease(system)}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {busyId === id
                                  ? <LoaderCircle size={15} className="animate-spin" />
                                  : <Check size={15} />}
                              </button>
                            )}

                            {canManage && !occupied && (
                              <button
                                type="button"
                                title={status === "maintenance" ? "Mark available" : "Mark maintenance"}
                                disabled={busyId === id}
                                onClick={() => handleToggleMaintenance(system)}
                                className="rounded-lg border border-amber-200 p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                              >
                                <Edit3 size={15} />
                              </button>
                            )}

                            {canManage && (
                              <button
                                type="button"
                                title="Delete system"
                                disabled={busyId === id || occupied}
                                onClick={() => handleDelete(system)}
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 size={15} />
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

            {/* Mobile / Tablet Cards */}
            <div className="grid gap-3 p-3 sm:p-4 lg:hidden">
              {filteredSystems.map((system) => {
                const id = getSystemId(system);
                const status = getSystemStatus(system);
                const occupied =
                  status === "occupied" ||
                  Boolean(system.currentScheduledExam);

                return (
                  <article key={id} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Monitor size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold text-gray-900">
                          {system.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          System #{system.systemNumber}
                        </p>
                        <div className="mt-2">
                          <SystemStatusBadge status={status} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-400">Laboratory</p>
                        <p className="mt-1 break-words text-xs font-semibold text-gray-800">
                          {system.labName || "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-400">IP Address</p>
                        <p className="mt-1 break-all text-xs font-semibold text-gray-800">
                          {system.ipAddress || "No IP"}
                        </p>
                      </div>
                    </div>

                    {system.macAddress && (
                      <p className="mt-3 break-all text-xs text-gray-500">
                        MAC: {system.macAddress}
                      </p>
                    )}

                    {system.currentScheduledExam && (
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-blue-600">
                          Current Assignment
                        </p>
                        <p className="mt-1 break-all text-xs text-blue-900">
                          {system.currentScheduledExam?.examId?.title ||
                            system.currentScheduledExam?.examTitle ||
                            getExamId(system)}
                        </p>
                      </div>
                    )}

                    {canManage && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                        {status === "available" && (
                          <button
                            type="button"
                            onClick={() => setAllocateTarget(system)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                          >
                            <Zap size={14} />
                            Allocate
                          </button>
                        )}

                        {occupied && (
                          <button
                            type="button"
                            disabled={busyId === id}
                            onClick={() => handleRelease(system)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <Check size={14} />
                            Release
                          </button>
                        )}

                        {!occupied && (
                          <button
                            type="button"
                            disabled={busyId === id}
                            onClick={() => handleToggleMaintenance(system)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            <Edit3 size={14} />
                            {status === "maintenance" ? "Mark Available" : "Maintenance"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={busyId === id || occupied}
                          onClick={() => handleDelete(system)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Access information */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-700" />
        <div>
          <p className="text-sm font-bold text-blue-900">System access</p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            All roles can view the system list. Admins and operators can add,
            allocate, release and manage systems. Backend authorization must
            enforce these permissions too.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && canManage && (
        <SystemModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          saving={saving}
        />
      )}

      {allocateTarget && canManage && (
        <AllocateModal
          system={allocateTarget}
          onClose={() => setAllocateTarget(null)}
          onAllocate={handleAllocate}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SystemPage;
