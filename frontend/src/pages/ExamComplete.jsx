import React from "react";

const ExamComplete = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl">
          ✓
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mt-5">
          Exam Submitted
        </h1>

        <p className="text-gray-600 mt-3">
          Your exam has been submitted successfully.
        </p>
      </div>
    </div>
  );
};

export default ExamComplete;
