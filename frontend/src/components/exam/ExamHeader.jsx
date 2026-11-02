import React from "react";

const ExamHeader = ({
  examTitle = "Campus Recruitment - Online Assessment",
  candidateName = "Candidate",
  candidatePhoto = "",
}) => {
  return (
    <header className="w-full bg-[#064273] text-white shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="font-bold text-sm">CBT</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-semibold truncate">
                {examTitle}
              </h1>
              <p className="text-xs md:text-sm text-blue-100">
                Online Assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center">
              {candidatePhoto ? (
                <img
                  src={candidatePhoto}
                  alt={candidateName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {candidateName?.charAt(0)?.toUpperCase() || "C"}
                </span>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-[10px] uppercase tracking-wider text-blue-200">
                Candidate
              </p>
              <p className="text-sm md:text-base font-semibold truncate max-w-[180px]">
                {candidateName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
