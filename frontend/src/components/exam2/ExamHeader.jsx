// src/components/exam/ExamHeader.jsx

import { useState } from "react";
import Timer from "../common/Timer";

export default function ExamHeader({
  candidateName = "Candidate",
  duration = 60 * 60,
  onTimeUp,
  sectionName = "Assessment",
  sectionNumber,
  totalSections,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ==================================================
  // FULLSCREEN
  // ==================================================

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <header className="w-full h-[70px] bg-[#064273] text-white shadow-sm shrink-0">
      <div className="h-full flex items-center justify-between px-4 md:px-6">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <div className="flex items-center min-w-0">

          {/* TCS LOGO */}
          <div className="flex items-center gap-2 shrink-0">

            <div className="text-xl md:text-2xl font-bold tracking-tight">
              IPS
            </div>

            <div className="hidden sm:block text-xs md:text-sm font-medium whitespace-nowrap">
              UNIVERSITY
            </div>

          </div>

          {/* DIVIDER */}
          <div className="hidden md:block h-8 w-px bg-white/30 mx-5" />

          {/* EXAM TITLE */}
          <div className="hidden lg:block min-w-0">

            <p className="text-xs text-white/60">
              Campus Recruitment
            </p>

            <p className="text-sm font-medium truncate max-w-[320px]">
              Online Assessment
            </p>

          </div>

        </div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="flex items-center gap-2 md:gap-4">

          {/* ==================================================
              CURRENT SECTION
          ================================================== */}

          <div className="hidden md:block text-right mr-1">

            <p className="text-[10px] text-white/60 uppercase tracking-wide">
              Current Section
            </p>

            <p className="text-xs md:text-sm font-semibold max-w-[160px] truncate">
              {sectionName}
            </p>

          </div>

          {/* SECTION NUMBER */}
          {sectionNumber && totalSections && (
            <div className="hidden sm:flex items-center px-3 py-2 rounded-md bg-white/10 border border-white/10">

              <span className="text-xs text-white/70">
                Section
              </span>

              <span className="ml-1.5 text-sm font-semibold">
                {sectionNumber}/{totalSections}
              </span>

            </div>
          )}

          {/* ==================================================
              TIMER
          ================================================== */}

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 border border-white/10">

            <span className="text-xs text-white/70 hidden sm:inline">
              Time Left
            </span>

            <Timer
  key={sectionNumber}
  duration={duration}
  onTimeUp={onTimeUp}
/>

          </div>

          {/* ==================================================
              FULLSCREEN
          ================================================== */}

          <button
            type="button"
            onClick={handleFullscreen}
            title={
              isFullscreen
                ? "Exit Fullscreen"
                : "Enter Fullscreen"
            }
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10 transition"
          >
            {isFullscreen ? (
              <span className="text-lg">⛶</span>
            ) : (
              <span className="text-lg">⛶</span>
            )}
          </button>

          {/* ==================================================
              HELP
          ================================================== */}

          <button
            type="button"
            title="Help"
            onClick={() => {
              window.alert(
                "For help regarding the assessment, please contact the examination administrator."
              );
            }}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10 transition text-sm font-semibold"
          >
            ?
          </button>

          {/* ==================================================
              CANDIDATE
          ================================================== */}

          <div className="flex items-center gap-2 pl-1">

            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
              <span className="text-sm font-semibold">
                {candidateName?.charAt(0)?.toUpperCase() || "C"}
              </span>
            </div>

            <div className="hidden md:block">

              <p className="text-xs font-medium max-w-[100px] truncate">
                {candidateName}
              </p>

              <p className="text-[10px] text-white/60">
                Candidate
              </p>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}