import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getAllStudents,
  deleteStudent,
} from "../services/studentApi";

const API_URL = "http://localhost:4000";

// =====================================================
// Image URL Helper
// =====================================================
const getImageUrl = (image) => {
  if (!image) return null;

  // Already complete URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Already correct API upload path
  if (image.startsWith("/api/uploads")) {
    return `${API_URL}${image}`;
  }

  // Old DB path: /uploads/users/filename.jpg
  if (image.startsWith("/uploads/")) {
    return `${API_URL}/api${image}`;
  }

  // Only filename stored
  return `${API_URL}/api/uploads/users/${image}`;
};

const Students = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    course: "",
    branch: "",
    semester: "",
    formStatus: "",
    blacklist: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // =====================================================
  // FETCH STUDENTS FROM API
  // =====================================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await getAllStudents();

      console.log("Students API Response:", response);
      console.log("Students API Data:", response?.data);

      const studentData =
        response?.data?.users ||
        response?.data?.students ||
        (Array.isArray(response?.data)
          ? response.data
          : []);

      console.log("Students List:", studentData);

      // Normalize image URL
      const studentsWithImages = studentData.map((student) => {
        const imageUrl = getImageUrl(student.image);

        console.log("Student:", student.name);
        console.log("Image from API:", student.image);
        console.log("Final Image URL:", imageUrl);

        return {
          ...student,
          imageUrl,
        };
      });

      setStudents(studentsWithImages);
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const courseOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.course)
          .filter(
            (value) =>
              value &&
              value.trim() !== ""
          )
      ),
    ].sort();
  }, [students]);

  const branchOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.branch)
          .filter(
            (value) =>
              value &&
              value.trim() !== ""
          )
      ),
    ].sort();
  }, [students]);

  const semesterOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.semester)
          .filter(
            (value) =>
              value &&
              value.trim() !== ""
          )
      ),
    ].sort();
  }, [students]);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        student.name
          ?.toLowerCase()
          .includes(searchText) ||
        student.email
          ?.toLowerCase()
          .includes(searchText) ||
        student.rollNo
          ?.toLowerCase()
          .includes(searchText);

      const matchesCourse =
        !filters.course ||
        student.course === filters.course;

      const matchesBranch =
        !filters.branch ||
        student.branch === filters.branch;

      const matchesSemester =
        !filters.semester ||
        student.semester === filters.semester;

      const matchesFormStatus =
        !filters.formStatus ||
        (filters.formStatus === "filled" &&
          Boolean(student.formStatus)) ||
        (filters.formStatus === "not-filled" &&
          !Boolean(student.formStatus));

      const matchesBlacklist =
        !filters.blacklist ||
        (filters.blacklist === "blacklisted" &&
          Boolean(student.blacklisted)) ||
        (filters.blacklist === "active" &&
          !Boolean(student.blacklisted));

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesSemester &&
        matchesFormStatus &&
        matchesBlacklist
      );
    });
  }, [students, search, filters]);

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");

    setFilters({
      course: "",
      branch: "",
      semester: "",
      formStatus: "",
      blacklist: "",
    });
  };

  // =====================================================
  // ACTIVE FILTER COUNT
  // =====================================================

  const activeFilterCount = Object.values(
    filters
  ).filter(Boolean).length;

  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(student._id);

      await deleteStudent(student._id);

      setStudents((prev) =>
        prev.filter(
          (item) =>
            item._id !== student._id
        )
      );

      toast.success(
        "Student deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete student:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete student."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleAddStudent = () => {
    navigate("/students/create");
  };

  const handleViewStudent = (id) => {
    navigate(`/students/${id}`);
  };

  const handleEditStudent = (id) => {
    // Profile + Edit same component
    navigate(`/students/${id}`);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full min-w-0 overflow-hidden p-4">

     

      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">
          <div className="flex items-center gap-3">

            <div className="shrink-0 rounded-xl bg-blue-600 p-3 text-white shadow-sm">
              <Users size={23} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                Students
              </h1>

              <p className="truncate text-sm text-gray-500">
                Manage all registered students
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={handleAddStudent}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Student
        </button>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="shrink-0 rounded-lg bg-blue-100 p-2.5 text-blue-600">
              <Users size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                Total Students
              </p>

              <p className="text-xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>

          </div>
        </div>

        {/* FORM FILLED */}

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="shrink-0 rounded-lg bg-green-100 p-2.5 text-green-600">
              <UserCheck size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                Form Filled
              </p>

              <p className="text-xl font-bold text-gray-900">
                {
                  students.filter(
                    (student) =>
                      Boolean(
                        student.formStatus
                      )
                  ).length
                }
              </p>
            </div>

          </div>
        </div>

        {/* FORM NOT FILLED */}

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="shrink-0 rounded-lg bg-orange-100 p-2.5 text-orange-600">
              <UserX size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                Form Not Filled
              </p>

              <p className="text-xl font-bold text-gray-900">
                {
                  students.filter(
                    (student) =>
                      !Boolean(
                        student.formStatus
                      )
                  ).length
                }
              </p>
            </div>

          </div>
        </div>

        {/* BLACKLISTED */}

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="shrink-0 rounded-lg bg-red-100 p-2.5 text-red-600">
              <ShieldAlert size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                Blacklisted
              </p>

              <p className="text-xl font-bold text-gray-900">
                {
                  students.filter(
                    (student) =>
                      Boolean(
                        student.blacklisted
                      )
                  ).length
                }
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="border-b border-gray-200 p-4">

          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative min-w-0 flex-1 lg:max-w-md">

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
                placeholder="Search by name, email or roll no..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex shrink-0 gap-2">

              <button
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  showFilters ||
                  activeFilterCount > 0
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={17} />

                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={16} />
                  Clear
                </button>
              )}

            </div>

          </div>

          {/* FILTERS */}

          {showFilters && (
            <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

              {/* COURSE */}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Course
                </label>

                <select
                  value={filters.course}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      course: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Courses
                  </option>

                  {courseOptions.map(
                    (course) => (
                      <option
                        key={course}
                        value={course}
                      >
                        {course}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* BRANCH */}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Branch
                </label>

                <select
                  value={filters.branch}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Branches
                  </option>

                  {branchOptions.map(
                    (branch) => (
                      <option
                        key={branch}
                        value={branch}
                      >
                        {branch}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SEMESTER */}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Semester
                </label>

                <select
                  value={filters.semester}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      semester:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Semesters
                  </option>

                  {semesterOptions.map(
                    (semester) => (
                      <option
                        key={semester}
                        value={semester}
                      >
                        {semester}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* FORM STATUS */}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Form Status
                </label>

                <select
                  value={filters.formStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      formStatus:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All
                  </option>

                  <option value="filled">
                    Filled
                  </option>

                  <option value="not-filled">
                    Not Filled
                  </option>
                </select>
              </div>

              {/* ACCOUNT STATUS */}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Account Status
                </label>

                <select
                  value={filters.blacklist}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      blacklist:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Students
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="blacklisted">
                    Blacklisted
                  </option>
                </select>
              </div>

            </div>
          )}

        </div>

        {/* TABLE HEADER */}

        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">

          <div className="min-w-0">

            <h2 className="font-semibold text-gray-900">
              Student List
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Showing{" "}
              {filteredStudents.length} of{" "}
              {students.length} students
            </p>

          </div>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">

            <div className="mb-3 rounded-full bg-gray-100 p-4">
              <Users
                size={30}
                className="text-gray-400"
              />
            </div>

            <h3 className="font-semibold text-gray-800">
              No students found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>

          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Roll No
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Course
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Branch
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Semester
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Form
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredStudents.map(
                  (student) => (
                    <tr
                      key={student._id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* STUDENT */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                          {student.imageUrl ? (
                            <img
                              src={student.imageUrl}
                              alt={student.name}
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                              onLoad={() => {
                                console.log(
                                  "Student image loaded:",
                                  student.imageUrl
                                );
                              }}
                              onError={() => {
                                console.error(
                                  "Student image failed:",
                                  student.imageUrl
                                );
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                              {student.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                            </div>
                          )}

                          <div className="min-w-0">

                            <p className="max-w-[180px] truncate text-sm font-semibold text-gray-900">
                              {student.name}
                            </p>

                            <p className="max-w-[200px] truncate text-xs text-gray-500">
                              {student.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ROLL NO */}

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        {student.rollNo || "-"}
                      </td>

                      {/* COURSE */}

                      <td className="max-w-[150px] truncate px-4 py-4 text-sm text-gray-700">
                        {student.course || "-"}
                      </td>

                      {/* BRANCH */}

                      <td className="max-w-[160px] truncate px-4 py-4 text-sm text-gray-700">
                        {student.branch || "-"}
                      </td>

                      {/* SEMESTER */}

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        {student.semester || "-"}
                      </td>

                      {/* FORM */}

                      <td className="px-4 py-4">

                        {student.formStatus ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            <UserCheck size={13} />
                            Filled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                            <UserX size={13} />
                            Not Filled
                          </span>
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        {student.blacklisted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <ShieldAlert size={13} />
                            Blacklisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <UserCheck size={13} />
                            Active
                          </span>
                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-4">

                        <div className="flex items-center justify-end gap-1">

                          {/* VIEW */}

                          <button
                            onClick={() =>
                              handleViewStudent(
                                student._id
                              )
                            }
                            title="View Student"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Eye size={17} />
                          </button>

                          {/* EDIT */}

                          <button
                            onClick={() =>
                              handleEditStudent(
                                student._id
                              )
                            }
                            title="Edit Student"
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(
                                student
                              )
                            }
                            disabled={
                              deletingId ===
                              student._id
                            }
                            title="Delete Student"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            student._id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={17}
                              />
                            )}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}

        {!loading &&
          filteredStudents.length > 0 && (
            <div className="flex min-w-0 items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-5">

              <p className="truncate text-sm text-gray-500">
                {filteredStudents.length}{" "}
                student(s) displayed
              </p>

            </div>
          )}

      </div>
    </div>
  );
};

export default Students;