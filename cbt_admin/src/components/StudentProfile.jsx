import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Mail,
  Lock,
  Hash,
  BookOpen,
  GraduationCap,
  Layers,
  ShieldAlert,
  CheckCircle,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getStudentProfile,
  updateStudent,
} from "../services/studentApi";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // =====================================================
  // Get Student
  // =====================================================
  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
  try {
    setLoading(true);

    const response = await getStudentProfile(id);

    // =====================================================
    // DEBUG: Complete API Response
    // =====================================================
    console.log("========== STUDENT API RESPONSE ==========");
    console.log("Response:", response);
    console.log("Response Data:", response?.data);

    const data = response?.data?.user || response?.data;

    // =====================================================
    // DEBUG: Student Data
    // =====================================================
    console.log("========== STUDENT DATA ==========");
    console.log("Student:", data);
    console.log("Student ID:", data?._id || data?.id);
    console.log("Student Name:", data?.name);
    console.log("Student Email:", data?.email);
    console.log("Student Image:", data?.image);
    console.log("Student Roll No:", data?.rollNo);
    console.log("Student Course:", data?.course);
    console.log("Student Branch:", data?.branch);
    console.log("Student Semester:", data?.semester);

    setStudent(data);

    setFormData({
      name: data?.name || "",
      email: data?.email || "",
      password: "",
      rollNo: data?.rollNo || "",
      course: data?.course || "",
      branch: data?.branch || "",
      semester: data?.semester || "",
      blacklisted: data?.blacklisted || false,
      formStatus: data?.formStatus || false,
      image: null,
    });

    // =====================================================
    // Student Image
    // =====================================================
    if (data?.image) {
  const imageUrl = data.image.startsWith("http")
    ? data.image
    : `http://localhost:4000${
        data.image.startsWith("/api")
          ? data.image
          : data.image.startsWith("/")
          ? `/api${data.image}`
          : `/api/uploads/users/${data.image}`
      }`;

  console.log("Student Image From DB:", data.image);
  console.log("Final Image URL:", imageUrl);

  setPreview(imageUrl);
} else {
  console.log("No student image found");
  setPreview(null);
}
  } catch (error) {
    console.error("========== STUDENT FETCH ERROR ==========");
    console.error("Error:", error);
    console.error("Response:", error?.response);
    console.error("Response Data:", error?.response?.data);

    toast.error(
      error?.response?.data?.message ||
        "Failed to load student details"
    );
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // Handle Change
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // Image Change
  // =====================================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  // =====================================================
  // Cancel Edit
  // =====================================================
  const handleCancelEdit = () => {
    setEditing(false);

    setFormData({
      name: student?.name || "",
      email: student?.email || "",
      password: "",
      rollNo: student?.rollNo || "",
      course: student?.course || "",
      branch: student?.branch || "",
      semester: student?.semester || "",
      blacklisted: student?.blacklisted || false,
      formStatus: student?.formStatus || false,
      image: null,
    });

    if (student?.image) {
      setPreview(
        student.image.startsWith("http")
          ? student.image
          : `http://localhost:4000${student.image}`
      );
    }
  };

  // =====================================================
  // Update Student
  // =====================================================
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Student name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("rollNo", formData.rollNo || "");
      data.append("course", formData.course || "");
      data.append("branch", formData.branch || "");
      data.append("semester", formData.semester || "");
      data.append("blacklisted", formData.blacklisted);
      data.append("formStatus", formData.formStatus);

      // Password only when entered
      if (formData.password) {
        data.append("password", formData.password);
      }

      // Image only when changed
      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await updateStudent(id, data);

      const updatedStudent =
        response?.data?.user || response?.data;

      setStudent(updatedStudent);

      setFormData((prev) => ({
        ...prev,
        password: "",
        image: null,
      }));

      if (updatedStudent?.image) {
        setPreview(
          updatedStudent.image.startsWith("http")
            ? updatedStudent.image
            : `http://localhost:4000${updatedStudent.image}`
        );
      }

      setEditing(false);

      toast.success("Student updated successfully");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update student"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading student...
        </div>
      </div>
    );
  }

  // =====================================================
  // Not Found
  // =====================================================
  if (!student) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            Student not found.
          </p>

          <button
            onClick={() => navigate("/students")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden bg-gray-50 p-4 md:p-6">
      {/* =====================================================
          Header
      ===================================================== */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Student Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage student information.
          </p>
        </div>

        {/* =================================================
            Edit / Cancel
        ================================================= */}
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Edit size={17} />
            Edit Student
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <X size={17} />
            Cancel Edit
          </button>
        )}
      </div>

      {/* =====================================================
          Main
      ===================================================== */}
      <form onSubmit={handleSave}>
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
              Profile Card
          ================================================= */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              {/* Image */}
              <div className="h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {preview ? (
                 <img
  src={preview}
  alt={student.name}
  className="h-full w-full object-cover"
  onLoad={() => {
    console.log("Student image loaded successfully:", preview);
  }}
  onError={(e) => {
    console.error("Student image failed to load:", preview);
    console.error("Image error:", e);
    setPreview(null);
  }}
/>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <User size={55} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Change Image */}
              {editing && (
                <>
                  <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Upload size={16} />
                    Change Photo

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {student.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {student.email}
              </p>

              {/* Status */}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {student.formStatus ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    <CheckCircle size={13} />
                    Form Filled
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                    Form Pending
                  </span>
                )}

                {student.blacklisted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    <ShieldAlert size={13} />
                    Blacklisted
                  </span>
                )}
              </div>
            </div>

            {/* Account Status */}
            {editing && (
              <div className="mt-7 border-t border-gray-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-800">
                  Account Status
                </h3>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <input
                    type="checkbox"
                    name="formStatus"
                    checked={formData.formStatus}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Form Filled
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Student registration form is complete.
                    </p>
                  </div>
                </label>

                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <input
                    type="checkbox"
                    name="blacklisted"
                    checked={formData.blacklisted}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Blacklisted
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Prevent student from participating in exams.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* =================================================
              Details
          ================================================= */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            {/* Personal Information */}
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Student Name
                </label>

                {editing ? (
                  <Input
                    icon={<User size={18} />}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <Value value={student.name} />
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                {editing ? (
                  <Input
                    icon={<Mail size={18} />}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <Value value={student.email} />
                )}
              </div>

              {/* Password */}
              {editing && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                  </label>

                  <Input
                    icon={<Lock size={18} />}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              )}

              {/* Roll No */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Roll Number
                </label>

                {editing ? (
                  <Input
                    icon={<Hash size={18} />}
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                  />
                ) : (
                  <Value value={student.rollNo} />
                )}
              </div>
            </div>

            {/* Academic */}
            <div className="mt-8 border-t border-gray-100 pt-7">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Course */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Course
                  </label>

                  {editing ? (
                    <div className="relative">
                      <BookOpen
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="BBA">BBA</option>
                        <option value="MBA">MBA</option>
                        <option value="B.Pharm">B.Pharm</option>
                        <option value="M.Pharm">M.Pharm</option>
                      </select>
                    </div>
                  ) : (
                    <Value value={student.course} />
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Branch
                  </label>

                  {editing ? (
                    <Input
                      icon={<GraduationCap size={18} />}
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                    />
                  ) : (
                    <Value value={student.branch} />
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Semester
                  </label>

                  {editing ? (
                    <div className="relative">
                      <Layers
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                        <option value="3">3rd Semester</option>
                        <option value="4">4th Semester</option>
                        <option value="5">5th Semester</option>
                        <option value="6">6th Semester</option>
                        <option value="7">7th Semester</option>
                        <option value="8">8th Semester</option>
                      </select>
                    </div>
                  ) : (
                    <Value
                      value={
                        student.semester
                          ? `${student.semester} Semester`
                          : ""
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Save */}
            {editing && (
              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// Reusable Input
// =====================================================
const Input = ({
  icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

// =====================================================
// Read Only Value
// =====================================================
const Value = ({ value }) => {
  return (
    <div className="min-h-[42px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
      {value || "Not provided"}
    </div>
  );
};

export default StudentProfile;