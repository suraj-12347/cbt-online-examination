import React from "react";

const SubmitExamModal = ({
  open,
  onClose,
  onConfirm,
  answered = 0,
  unanswered = 0,
  marked = 0,
  submitting = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Submit Exam?
        </h2>

        <p className="text-sm text-gray-600 mt-2">
          Are you sure you want to submit your exam?
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">{answered}</p>
            <p className="text-xs text-gray-600">Answered</p>
          </div>

          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-700">{unanswered}</p>
            <p className="text-xs text-gray-600">Unanswered</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-yellow-700">{marked}</p>
            <p className="text-xs text-gray-600">Review</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Confirm Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitExamModal;
