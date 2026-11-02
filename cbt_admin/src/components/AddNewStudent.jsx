import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Upload,
  User,
  Mail,
  Lock,
  Hash,
  BookOpen,
  GraduationCap,
  Layers,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";

import { registerStudent } from "../services/studentApi";

const AddNewStudent = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNo: "",
    course: "",
    branch: "",
    semester: "",
    image: null,
    blacklisted: false,
    formStatus: false,
  });

  // =====================================================
  // Handle Input
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // Handle Image
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
  // Submit
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Student name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("rollNo", formData.rollNo);
      data.append("course", formData.course);
      data.append("branch", formData.branch);
      data.append("semester", formData.semester);
      data.append("blacklisted", formData.blacklisted);
      data.append("formStatus", formData.formStatus);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await registerStudent(data);

      toast.success("Student added successfully!");

      navigate("/students");
    } catch (error) {
      console.error("Add student error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to add student. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Add New Student
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new student account and add their academic details.
          </p>
        </div>
      </div>

      {/* =====================================================
          Form
      ===================================================== */}
      <form onSubmit={handleSubmit}>
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
              Left - Profile Image
          ================================================= */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Student Photo
            </h2>

            <div className="flex flex-col items-center">
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                {preview ? (
                  <img
                    src={preview}
                    alt="Student preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <User size={52} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <Upload size={17} />

                {preview ? "Change Photo" : "Upload Photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-center text-xs text-gray-400">
                JPG, PNG or WEBP
                <br />
                Maximum 5MB
              </p>
            </div>

            {/* Status */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">
                Account Status
              </h3>

              {/* Form Status */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  name="formStatus"
                  checked={formData.formStatus}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <CheckCircle size={16} />
                    Form Filled
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Mark if student's registration form is complete.
                  </p>
                </div>
              </label>

              {/* Blacklisted */}
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  name="blacklisted"
                  checked={formData.blacklisted}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <ShieldAlert size={16} />
                    Blacklisted
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Prevent this student from participating in exams.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* =================================================
              Right - Student Details
          ================================================= */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            {/* Personal Information */}
            <div>
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Student Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter student name"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Roll Number
                  </label>

                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="Enter roll number"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
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

                  <div className="relative">
                    <BookOpen
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                </div>

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Branch
                  </label>

                  <div className="relative">
                    <GraduationCap
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Semester
                  </label>

                  <div className="relative">
                    <Layers
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                </div>
              </div>
            </div>

            {/* =================================================
                Buttons
            ================================================= */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/students")}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={18} />

                {loading ? "Adding Student..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewStudent;