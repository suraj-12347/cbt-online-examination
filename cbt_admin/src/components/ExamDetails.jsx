
import { useState } from "react";
import { ArrowRight, Calendar, Clock, FileText } from "lucide-react";

const ExamDetailsForm = ({ initialData = {}, onNext }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    startDate: initialData.startDate || "",
    endDate: initialData.endDate || "",
    duration: initialData.duration || "",
    totalMarks: initialData.totalMarks || "",
    negativeMarking:
      initialData.negativeMarking !== undefined
        ? initialData.negativeMarking
        : true,
    status: initialData.status || "draft",
  });

  const [errors, setErrors] = useState({});

  // START: Handle Input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  // END: Handle Input


  // START: Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Exam title is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate =
        "End date cannot be earlier than start date";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  // END: Validate Form


  // START: Next
  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    onNext({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: Number(formData.duration),
      totalMarks: formData.totalMarks
        ? Number(formData.totalMarks)
        : 0,
    });
  };
  // END: Next


  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Exam Details
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter the basic details of your exam
            </p>
          </div>
        </div>
      </div>


      {/* Form */}
      <div className="p-6 space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Title
            <span className="text-red-500 ml-1">*</span>
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter exam title"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition
              ${
                errors.title
                  ? "border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
          />

          {errors.title && (
            <p className="text-sm text-red-500 mt-1">
              {errors.title}
            </p>
          )}
        </div>


        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter exam description"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>


        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>

            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>


          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>

            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-100
                  ${
                    errors.endDate
                      ? "border-red-400"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
              />
            </div>

            {errors.endDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.endDate}
              </p>
            )}
          </div>

        </div>


        {/* Duration + Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Minutes)
              <span className="text-red-500 ml-1">*</span>
            </label>

            <div className="relative">
              <Clock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 60"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none
                  ${
                    errors.duration
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
              />
            </div>

            {errors.duration && (
              <p className="text-sm text-red-500 mt-1">
                {errors.duration}
              </p>
            )}
          </div>


          {/* Total Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Marks
            </label>

            <input
              type="number"
              name="totalMarks"
              min="0"
              value={formData.totalMarks}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>


        {/* Negative Marking + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Negative Marking */}
          <div className="border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-medium text-gray-800">
                  Negative Marking
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Enable negative marking for wrong answers
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                  className="sr-only peer"
                />

                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow absolute left-0.5 top-0.5 peer-checked:translate-x-5 transition" />
                </div>
              </label>

            </div>
          </div>


          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

        </div>


        {/* Footer */}
        <div className="pt-5 border-t border-gray-200 flex justify-end">

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
          >
            Next: Select Sections
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default ExamDetailsForm;

