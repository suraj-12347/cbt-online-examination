
import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Computer,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  allocateSystemToExam,
  getAvailableSystems,
} from "../services/systemApi";

const getSystemId = (system) => system?._id || system?.id;

const getResponseSystems = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.systems)) return payload.systems;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.systems)) {
    return payload.data.systems;
  }

  return [];
};

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const SystemAllocation = ({
  records = [],
  setRecords,
  getStudentName = (student) =>
    student?.name ||
    student?.studentName ||
    student?.studentId?.name ||
    "Unknown Student",
}) => {
  const [systems, setSystems] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState({});
  const [systemSelections, setSystemSelections] = useState({});
  const [allocatingId, setAllocatingId] = useState(null);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load available systems from backend.
  const refreshSystems = useCallback(async () => {
    try {
      setSystemsLoading(true);
      setError("");

      const response = await getAvailableSystems();
      const responseSystems = getResponseSystems(response);

      // Only keep systems that are available.
      const availableSystems = responseSystems.filter((system) => {
        const status = String(
          system?.status || "available"
        ).toLowerCase();

        return (
          status === "available" &&
          !system?.currentScheduledExam &&
          !system?.allocatedTo
        );
      });

      setSystems(availableSystems);

      // Clear selected systems that are no longer available.
      setSystemSelections((previous) => {
        const availableIds = new Set(
          availableSystems.map((system) =>
            String(getSystemId(system))
          )
        );

        const updated = {};

        Object.entries(previous).forEach(([recordId, systemId]) => {
          if (availableIds.has(String(systemId))) {
            updated[recordId] = systemId;
          }
        });

        return updated;
      });

      // Keep the selected lab only if it still has available systems.
      setSelectedLabs((previous) => {
        const updated = { ...previous };

        Object.entries(previous).forEach(([recordId, labName]) => {
          const labStillAvailable = availableSystems.some(
            (system) =>
              String(system?.labName || "").trim() === labName
          );

          if (!labStillAvailable) {
            delete updated[recordId];
          }
        });

        return updated;
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load available systems."
        )
      );
    } finally {
      setSystemsLoading(false);
    }
  }, []);

  // Automatically fetch systems when component mounts.
  useEffect(() => {
    refreshSystems();
  }, [refreshSystems]);

  // Unique labs that currently have available systems.
  const availableLabs = [
    ...new Set(
      systems
        .filter(
          (system) =>
            String(system?.status || "available").toLowerCase() ===
            "available"
        )
        .map((system) => String(system?.labName || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  // Return available systems for the selected lab.
  const getFilteredSystems = (recordId) => {
    const selectedLab = selectedLabs[recordId];

    if (!selectedLab) return [];

    return systems.filter(
      (system) =>
        String(system?.labName || "").trim() === selectedLab &&
        String(system?.status || "available").toLowerCase() ===
          "available"
    );
  };

  const eligibleRecords = records.filter(
    (record) =>
      record.attendanceStatus === "verified" &&
      !record.allocatedSystem &&
      !["completed", "cancelled", "absent"].includes(
        String(record.status || "").toLowerCase()
      )
  );

  const allocatedRecords = records.filter(
    (record) => Boolean(record.allocatedSystem)
  );

  const handleAllocate = async (record) => {
    const selectedSystemId = systemSelections[record._id];

    if (!selectedLabs[record._id]) {
      setError("Please select a lab first.");
      return;
    }

    if (!selectedSystemId) {
      setError("Please select an available system.");
      return;
    }

    if (
      record.attendanceStatus !== "verified" ||
      record.allocatedSystem ||
      ["completed", "cancelled", "absent"].includes(
        String(record.status || "").toLowerCase()
      )
    ) {
      setError(
        "This candidate is not eligible for system allocation."
      );
      return;
    }

    const selectedSystem = getFilteredSystems(record._id).find(
      (system) =>
        String(getSystemId(system)) === String(selectedSystemId)
    );

    if (!selectedSystem) {
      setError(
        "This system is no longer available. Please refresh systems."
      );
      await refreshSystems();
      return;
    }

    try {
      setAllocatingId(record._id);
      setError("");
      setSuccessMessage("");

      const response = await allocateSystemToExam(
        selectedSystemId,
        record._id
      );

      const payload = response?.data ?? response;

      const allocatedSystemValue =
        payload?.scheduledExam?.allocatedSystem ??
        payload?.data?.scheduledExam?.allocatedSystem ??
        selectedSystem.name ??
        `System ${selectedSystem.systemNumber || ""}`.trim();

      // Update the candidate in the parent state.
      if (typeof setRecords === "function") {
        setRecords((previous) =>
          previous.map((item) =>
            item._id === record._id
              ? {
                  ...item,
                  allocatedSystem: allocatedSystemValue,
                  allocatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      }

      // Remove the allocated system from the local available list.
      setSystems((previous) =>
        previous.filter(
          (system) =>
            String(getSystemId(system)) !== String(selectedSystemId)
        )
      );

      // Clear the selection for this candidate.
      setSystemSelections((previous) => {
        const updated = { ...previous };
        delete updated[record._id];
        return updated;
      });

      setSelectedLabs((previous) => {
        const updated = { ...previous };
        delete updated[record._id];
        return updated;
      });

      setSuccessMessage(
        `${getStudentName(record)} assigned to ${
          selectedSystem.name ||
          `System ${selectedSystem.systemNumber || ""}`.trim()
        }.`
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to allocate the selected system."
        )
      );
    } finally {
      setAllocatingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <Computer size={21} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              System Allocation
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Assign available computer systems to verified candidates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshSystems}
          disabled={systemsLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={systemsLoading ? "animate-spin" : ""}
          />
          {systemsLoading ? "Loading..." : "Refresh Systems"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:mx-6">
          <AlertCircle size={16} className="shrink-0" />

          <span className="flex-1">{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 sm:mx-6">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6">
        <SummaryCard
          label="Available Systems"
          value={systems.length}
          icon={<Computer size={17} />}
        />

        <SummaryCard
          label="Awaiting Allocation"
          value={eligibleRecords.length}
          icon={<Loader2 size={17} />}
        />

        <div className="col-span-2 sm:col-span-1">
          <SummaryCard
            label="Allocated Systems"
            value={allocatedRecords.length}
            icon={<CheckCircle2 size={17} />}
          />
        </div>
      </div>

      {/* Verified candidates */}
      <div className="border-t border-slate-100">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-sm font-bold text-slate-800">
            Verified Candidates
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Select a lab first. Only available systems from that lab will
            appear in the system dropdown.
          </p>
        </div>

        {eligibleRecords.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CheckCircle2
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No candidates awaiting allocation
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Verify a candidate's attendance to enable allocation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {eligibleRecords.map((record) => {
              const isAllocating = allocatingId === record._id;
              const filteredSystems = getFilteredSystems(record._id);

              const rollNo =
                typeof record.studentId === "object"
                  ? record.studentId?.rollNo
                  : record.rollNo;

              return (
                <div
                  key={record._id}
                  className="flex flex-col gap-4 p-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Candidate details */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {getStudentName(record)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Roll No: {rollNo || "—"}
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 size={12} />
                      Attendance Verified
                    </div>
                  </div>

                  {/* Lab dropdown + System dropdown + Assign button */}
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[580px] lg:grid-cols-[1fr_1fr_auto]">
                    {/* Lab dropdown */}
                    <div className="relative min-w-0">
                      <select
                        value={selectedLabs[record._id] || ""}
                        onChange={(event) => {
                          const lab = event.target.value;

                          setSelectedLabs((previous) => ({
                            ...previous,
                            [record._id]: lab,
                          }));

                          // Reset system selection when lab changes.
                          setSystemSelections((previous) => ({
                            ...previous,
                            [record._id]: "",
                          }));

                          setError("");
                          setSuccessMessage("");
                        }}
                        disabled={systemsLoading || isAllocating}
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {systemsLoading ? "Loading labs..." : "Select Lab"}
                        </option>

                        {availableLabs.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {/* System number dropdown */}
                    <div className="relative min-w-0">
                      <select
                        value={systemSelections[record._id] || ""}
                        onChange={(event) => {
                          setSystemSelections((previous) => ({
                            ...previous,
                            [record._id]: event.target.value,
                          }));

                          setError("");
                          setSuccessMessage("");
                        }}
                        disabled={
                          systemsLoading ||
                          isAllocating ||
                          !selectedLabs[record._id] ||
                          filteredSystems.length === 0
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {!selectedLabs[record._id]
                            ? "Select lab first"
                            : filteredSystems.length
                              ? "Select System No."
                              : "No systems available"}
                        </option>

                        {filteredSystems.map((system) => {
                          const systemId = getSystemId(system);

                          return (
                            <option
                              key={systemId}
                              value={systemId}
                            >
                              {system.systemNumber !== undefined &&
                              system.systemNumber !== ""
                                ? `System #${system.systemNumber}`
                                : system.name || "Computer System"}
                            </option>
                          );
                        })}
                      </select>

                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>

                    {/* Assign button */}
                    <button
                      type="button"
                      onClick={() => handleAllocate(record)}
                      disabled={
                        isAllocating ||
                        systemsLoading ||
                        !selectedLabs[record._id] ||
                        !systemSelections[record._id]
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-1"
                    >
                      {isAllocating ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Computer size={16} />
                      )}

                      {isAllocating ? "Assigning..." : "Assign System"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Allocation register */}
      <div className="border-t border-slate-100">
        <div className="px-5 py-4 sm:px-6">
          <h3 className="text-sm font-bold text-slate-800">
            Allocation Register
          </h3>
        </div>

        {allocatedRecords.length === 0 ? (
          <p className="px-5 pb-5 text-xs text-slate-400 sm:px-6">
            No systems have been allocated yet.
          </p>
        ) : (
          <div className="space-y-2 px-5 pb-5 sm:px-6">
            {allocatedRecords.map((record) => {
              const rollNo =
                typeof record.studentId === "object"
                  ? record.studentId?.rollNo
                  : record.rollNo;

              const allocatedSystem =
                typeof record.allocatedSystem === "object"
                  ? record.allocatedSystem?.name ||
                    record.allocatedSystem?.systemNumber ||
                    "Assigned"
                  : record.allocatedSystem;

              return (
                <div
                  key={record._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {getStudentName(record)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Roll No: {rollNo || "—"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-primary-light)] px-3 py-2">
                    <Computer
                      size={15}
                      className="text-[var(--color-primary)]"
                    />

                    <span className="max-w-[150px] truncate text-xs font-bold text-[var(--color-primary)]">
                      {allocatedSystem}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available systems */}
      <div className="border-t border-slate-100 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">
            Available Computer Lab Systems
          </h3>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {systems.length} Available
          </span>
        </div>

        {systemsLoading && systems.length === 0 ? (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-6 text-xs text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading available systems...
          </div>
        ) : systems.length === 0 ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            No systems currently available. Check the system status in
            the admin systems page.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {systems.map((system) => (
              <div
                key={getSystemId(system)}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                  <span className="truncate text-sm font-bold text-slate-800">
                    {system.systemNumber !== undefined &&
                    system.systemNumber !== ""
                      ? `System #${system.systemNumber}`
                      : system.name || "Computer System"}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-slate-500">
                  {system.labName || "Computer Lab"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SummaryCard = ({ label, value, icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between gap-2 text-slate-500">
      <span className="text-xs font-medium">{label}</span>
      {icon}
    </div>

    <p className="mt-3 text-2xl font-bold text-slate-900">
      {value}
    </p>
  </div>
);

export default SystemAllocation;
