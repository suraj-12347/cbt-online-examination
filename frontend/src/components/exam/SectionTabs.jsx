import React from "react";

const SectionTabs = ({ sections = [], currentSectionIndex = 0 }) => {
  return (
    <div className="border-b bg-white px-3 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {sections.map((section, index) => {
          const active = index === currentSectionIndex;

          return (
            <div
              key={section?._id || section?.id || index}
              className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-2 ${
                active
                  ? "border-[#064273] text-[#064273]"
                  : "border-transparent text-gray-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  active
                    ? "bg-[#064273] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </span>
              {section?.name || section?.shortName || `Section ${index + 1}`}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionTabs;
