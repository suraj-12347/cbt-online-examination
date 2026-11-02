import React from "react";
import {
  Search,
  Filter,
  X,
} from "lucide-react";

const AttemptFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  exam,
  setExam,
  exams = [],
  onClear,
}) => {
  const hasFilters =
    search || status || exam;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Filter
          size={18}
          className="text-gray-600"
        />

        <h3 className="font-semibold text-gray-800">
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Exam */}
        <select
          value={exam}
          onChange={(e) =>
            setExam(e.target.value)
          }
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Exams
          </option>

          {exams.map((item) => (
            <option
              key={item._id}
              value={item._id}
            >
              {item.title}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Status
          </option>

          <option value="started">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="expired">
            Expired
          </option>

          <option value="abandoned">
            Abandoned
          </option>
        </select>

        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={17} />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AttemptFilters;