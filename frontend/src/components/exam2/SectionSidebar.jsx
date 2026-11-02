// src/components/exam/SectionSidebar.jsx

export default function SectionSidebar({
  sections = [],
  currentSectionId,
  onSectionChange,
  completedSections = [],
}) {
  // ==================================================
  // CURRENT SECTION INDEX
  // ==================================================

  const currentSectionIndex = sections.findIndex(
    (section) => section.id === currentSectionId
  );

  // ==================================================
  // SECTION STATUS
  // ==================================================

  const getSectionStatus = (section, index) => {
    // Completed
    if (completedSections.includes(section.id)) {
      return "completed";
    }

    // Current
    if (section.id === currentSectionId) {
      return "active";
    }

    // Future
    if (index > currentSectionIndex) {
      return "locked";
    }

    // Previous section
    return "locked";
  };

  // ==================================================
  // HANDLE SECTION CLICK
  // ==================================================

  const handleSectionClick = (section, index) => {
    const status = getSectionStatus(section, index);

    // Only active section can be clicked
    if (status !== "active") {
      return;
    }

    onSectionChange?.(section.id);
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ==================================================
          SIDEBAR HEADER
      ================================================== */}

      <div className="px-4 py-4 border-b border-gray-200">

        <h2 className="text-sm font-semibold text-gray-800">
          Exam Sections
        </h2>

        <p className="text-xs text-gray-500 mt-1">
          Complete each section within its allotted time.
        </p>

      </div>

      {/* ==================================================
          SECTIONS
      ================================================== */}

      <div className="flex-1 overflow-y-auto p-3">

        <div className="space-y-2">

          {sections.map((section, index) => {
            const status = getSectionStatus(
              section,
              index
            );

            const isActive = status === "active";
            const isCompleted = status === "completed";
            const isLocked = status === "locked";

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  handleSectionClick(section, index)
                }
                disabled={!isActive}
                className={`
                  w-full text-left rounded-lg border
                  transition-all duration-200
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-50 shadow-sm cursor-default"
                      : isCompleted
                      ? "border-green-200 bg-green-50 cursor-not-allowed"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-80"
                  }
                `}
              >

                {/* ==================================================
                    SECTION TOP
                ================================================== */}

                <div className="p-3">

                  <div className="flex items-start gap-3">

                    {/* SECTION NUMBER / STATUS ICON */}

                    <div
                      className={`
                        w-9 h-9 min-w-[36px]
                        rounded-full
                        flex items-center justify-center
                        text-sm font-semibold
                        border
                        ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600"
                            : isCompleted
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-gray-200 text-gray-500 border-gray-300"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    {/* SECTION NAME */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <p
                          className={`
                            text-sm font-semibold leading-5
                            ${
                              isActive
                                ? "text-blue-800"
                                : isCompleted
                                ? "text-green-700"
                                : "text-gray-600"
                            }
                          `}
                        >
                          {section.name}
                        </p>

                        {/* LOCK ICON */}

                        {isLocked && (
                          <span
                            className="text-gray-400 text-sm"
                            title="Section Locked"
                          >
                            🔒
                          </span>
                        )}

                        {/* COMPLETED ICON */}

                        {isCompleted && (
                          <span
                            className="text-green-600 text-sm"
                            title="Section Completed"
                          >
                            ✓
                          </span>
                        )}

                      </div>

                      {/* ==================================================
                          SHORT NAME
                      ================================================== */}

                      {section.shortName && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {section.shortName}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* ==================================================
                      SECTION DETAILS
                  ================================================== */}

                  <div className="mt-3 grid grid-cols-2 gap-2">

                    {/* QUESTIONS */}

                    <div className="rounded-md bg-white/70 border border-gray-100 px-2 py-1.5">

                      <p className="text-[10px] text-gray-400 uppercase">
                        Questions
                      </p>

                      <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {section.totalQuestions ?? 0}
                      </p>

                    </div>

                    {/* DURATION */}

                    <div className="rounded-md bg-white/70 border border-gray-100 px-2 py-1.5">

                      <p className="text-[10px] text-gray-400 uppercase">
                        Time
                      </p>

                      <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {section.duration ?? 0} min
                      </p>

                    </div>

                  </div>

                  {/* ==================================================
                      STATUS MESSAGE
                  ================================================== */}

                  <div className="mt-3">

                    {isActive && (
                      <div className="flex items-center gap-2 text-[11px] text-blue-700">

                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />

                        <span className="font-medium">
                          Section in progress
                        </span>

                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-2 text-[11px] text-green-700">

                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[10px]">
                          ✓
                        </span>

                        <span className="font-medium">
                          Section completed
                        </span>

                      </div>
                    )}

                    {isLocked && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">

                        <span>🔒</span>

                        <span className="font-medium">
                          Locked
                        </span>

                      </div>
                    )}

                  </div>

                </div>

              </button>
            );
          })}

        </div>

      </div>

      {/* ==================================================
          BOTTOM INFORMATION
      ================================================== */}

      <div className="border-t border-gray-200 p-3">

        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">

          <p className="text-xs font-semibold text-blue-800">
            Sectional Timing
          </p>

          <p className="text-[11px] leading-4 text-blue-700 mt-1">
            Each section has a fixed time limit. Once the
            time expires, the section is locked and the
            next section is automatically unlocked.
          </p>

        </div>

      </div>

    </div>
  );
}