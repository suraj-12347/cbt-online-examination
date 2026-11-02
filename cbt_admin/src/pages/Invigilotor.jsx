
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Badge,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAllInvigilators,
  deleteInvigilator,
} from "../services/invigilatorApi";

const Invigilators = () => {
  const navigate = useNavigate();

  const [invigilators, setInvigilators] = useState([]);
  const [filteredInvigilators, setFilteredInvigilators] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================
  // Fetch Invigilators
  // ==========================================
  const fetchInvigilators = async () => {
    try {
      setLoading(true);

      const response = await getAllInvigilators();

      console.log("Invigilators API Response:", response.data);

      const data = response?.data;

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.invigilators)) {
        list = data.invigilators;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.data?.invigilators)) {
        list = data.data.invigilators;
      }

      setInvigilators(list);
      setFilteredInvigilators(list);
    } catch (error) {
      console.error("Fetch invigilators error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch invigilators"
      );

      setInvigilators([]);
      setFilteredInvigilators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvigilators();
  }, []);

  // ==========================================
  // Search + Filter
  // ==========================================
  useEffect(() => {
    let result = [...invigilators];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((invigilator) => {
        return (
          invigilator?.name?.toLowerCase().includes(searchValue) ||
          invigilator?.email?.toLowerCase().includes(searchValue) ||
          invigilator?.employeeId?.toLowerCase().includes(searchValue) ||
          invigilator?.phone?.toLowerCase().includes(searchValue)
        );
      });
    }

    if (statusFilter) {
      result = result.filter(
        (invigilator) =>
          invigilator?.status === statusFilter
      );
    }

    setFilteredInvigilators(result);
  }, [search, statusFilter, invigilators]);

  // ==========================================
  // Delete
  // ==========================================
  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invigilator?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await deleteInvigilator(id);

      toast.success("Invigilator deleted successfully");

      setInvigilators((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Delete invigilator error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete invigilator"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Image URL
  // ==========================================
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:4000${image}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ==========================================
          Header
      ========================================== */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Invigilators
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all examination invigilators
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/invigilators/create")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Invigilator
        </button>
      </div>

      {/* ==========================================
          Stats
      ========================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Invigilators
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {invigilators.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {
                  invigilators.filter(
                    (item) => item?.status === "active"
                  ).length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Inactive
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {
                  invigilators.filter(
                    (item) => item?.status === "inactive"
                  ).length
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <span className="h-3 w-3 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          Search / Filter
      ========================================== */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, employee ID or phone..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-44"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchInvigilators}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ==========================================
          Table
      ========================================== */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading invigilators...
              </p>
            </div>
          </div>
        ) : filteredInvigilators.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <User size={30} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No Invigilators Found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter
                ? "Try changing your search or filter."
                : "Create your first invigilator to get started."}
            </p>

            {!search && !statusFilter && (
              <button
                type="button"
                onClick={() =>
                  navigate("/invigilators/create")
                }
                className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Invigilator
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Invigilator
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employee ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredInvigilators.map((invigilator) => {
                  const id = invigilator?._id;

                  return (
                    <tr
                      key={id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Invigilator */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {invigilator?.image ? (
                            <img
                              src={getImageUrl(
                                invigilator.image
                              )}
                              alt={invigilator?.name || "Invigilator"}
                              className="h-11 w-11 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User size={21} />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-800">
                              {invigilator?.name || "-"}
                            </p>

                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                              <Mail size={14} />
                              {invigilator?.email || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Badge
                            size={16}
                            className="text-gray-400"
                          />
                          {invigilator?.employeeId || "-"}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        {invigilator?.phone ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone
                              size={15}
                              className="text-gray-400"
                            />
                            {invigilator.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not provided
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {invigilator?.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/invigilators/edit/${id}`
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(id)
                            }
                            disabled={deletingId === id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
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

      {/* Result count */}
      {!loading && filteredInvigilators.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {filteredInvigilators.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {invigilators.length}
          </span>{" "}
          invigilators
        </div>
      )}
    </div>
  );
};

export default Invigilators;
