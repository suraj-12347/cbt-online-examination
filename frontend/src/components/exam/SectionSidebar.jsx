import React from "react";

const SectionSidebar = ({ sections = [], currentSectionIndex = 0 }) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white border-r">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-800">Sections</h2>
        <p className="text-xs text-gray-500 mt-1">
          Sections unlock automatically when their time ends.
        </p>
      </div>

      <div className="p-2">
        {sections.map((section, index) => {
          const active = index === currentSectionIndex;
          const completed = index < currentSectionIndex;
          const locked = index > currentSectionIndex;

          return (
            <div
              key={section?._id || section?.id || index}
              className={`w-full px-3 py-3 rounded-lg mb-1 text-sm border ${
                active
                  ? "bg-blue-50 border-blue-200 text-[#064273]"
                  : completed
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-gray-50 border-transparent text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    active
                      ? "bg-[#064273] text-white"
                      : completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">
                    {section?.name || section?.shortName || `Section ${index + 1}`}
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {section?.totalQuestions ?? section?.questions?.length ?? 0} Questions
                  </div>
                </div>
                {locked && <span className="text-xs">🔒</span>}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SectionSidebar;
