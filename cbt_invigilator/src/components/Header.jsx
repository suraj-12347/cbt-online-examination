import React from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = ({ onMenuClick }) => {
  const { invigilator } = useAuth();
  const location = useLocation();

  const pageTitles = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: "Overview of your examination activities",
    },
    "/exams": {
      title: "My Exams",
      subtitle: "View and manage your assigned examinations",
    },
    "/attendance": {
      title: "Attendance",
      subtitle: "Verify candidate attendance",
    },
    "/monitoring": {
      title: "Monitoring",
      subtitle: "Monitor active examination sessions",
    },
    "/profile": {
      title: "My Profile",
      subtitle: "Manage your account information",
    },
  };

  const current =
    pageTitles[location.pathname] || pageTitles["/dashboard"];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const initials =
    invigilator?.name
      ?.split(" ")
      ?.map((word) => word?.charAt(0))
      ?.join("")
      ?.slice(0, 2)
      ?.toUpperCase() || "I";

  return (
    <header
      className="
        h-[78px]
        bg-[var(--color-surface)]
        border-b border-[var(--color-border)]
        sticky top-0
        z-30
      "
    >
      <div
        className="
          h-full
          px-4 sm:px-6 lg:px-8
          flex items-center justify-between
          gap-4
        "
      >
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="
              lg:hidden
              w-10 h-10
              rounded-xl
              border border-[var(--color-border)]
              bg-[var(--color-surface)]
              flex items-center justify-center
              text-[var(--color-muted)]
              hover:bg-[var(--color-primary-light)]
              hover:text-[var(--color-primary)]
              hover:border-[var(--color-primary)]
              active:bg-[var(--color-primary-light)]
              transition-all duration-200
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
            "
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div className="min-w-0">
            <h2
              className="
                text-[17px] sm:text-[19px]
                font-bold
                text-[var(--color-heading)]
                truncate
              "
            >
              {current.title}
            </h2>

            <p
              className="
                hidden sm:block
                text-[11px]
                text-[var(--color-muted)]
                mt-0.5
                truncate
              "
            >
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Date */}
          <div
            className="
              hidden md:flex
              items-center gap-2
              px-3.5
              h-10
              rounded-xl
              bg-[var(--color-primary-light)]
              border border-[var(--color-border)]
            "
          >
            <CalendarDays
              size={15}
              className="text-[var(--color-primary)]"
            />

            <span
              className="
                text-[12px]
                font-medium
                text-[var(--color-text)]
              "
            >
              {today}
            </span>
          </div>

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              w-10 h-10
              rounded-xl
              border border-[var(--color-border)]
              bg-[var(--color-surface)]
              flex items-center justify-center
              text-[var(--color-muted)]
              hover:bg-[var(--color-primary-light)]
              hover:text-[var(--color-primary)]
              hover:border-[var(--color-primary)]
              active:bg-[var(--color-primary-light)]
              transition-all duration-200
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2
            "
          >
            <Bell size={18} />

            {/* Notification Dot */}
            <span
              className="
                absolute
                top-[8px] right-[8px]
                w-[6px] h-[6px]
                rounded-full
                bg-[var(--color-primary)]
                ring-2 ring-[var(--color-surface)]
              "
            />
          </button>

          {/* User */}
          <div
            className="
              hidden sm:flex
              items-center
              gap-2.5
              pl-2
            "
          >
            {/* Avatar */}
            <div
              className="
                w-9 h-9
                rounded-full
                bg-[var(--color-primary-light)]
                text-[var(--color-primary)]
                border border-[var(--color-border)]
                flex items-center justify-center
                overflow-hidden
                shrink-0
              "
            >
              {invigilator?.image ? (
                <img
                  src={invigilator.image}
                  alt={invigilator.name || "Invigilator"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold">
                  {initials}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="hidden lg:block max-w-[140px]">
              <p
                className="
                  text-[12px]
                  font-semibold
                  text-[var(--color-heading)]
                  truncate
                "
              >
                {invigilator?.name || "Invigilator"}
              </p>

              <p
                className="
                  text-[10px]
                  text-[var(--color-muted)]
                  truncate
                  mt-0.5
                "
              >
                {invigilator?.employeeId || "Employee"}
              </p>
            </div>

            {/* Dropdown Icon */}
            <ChevronDown
              size={15}
              className="
                text-[var(--color-muted)]
                shrink-0
              "
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;