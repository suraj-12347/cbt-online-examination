import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Monitor,
  User,
  LogOut,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { invigilator, logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Exams",
      path: "/exams",
      icon: ClipboardList,
    },
    {
      label: "Attendance",
      path: "/attendance",
      icon: UserCheck,
    },
    {
      label: "Monitoring",
      path: "/monitoring",
      icon: Monitor,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  const handleLogout = () => {
    logout();
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* ================================
          MOBILE OVERLAY
      ================================= */}
      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-[var(--sidebar-overlay)]
            backdrop-blur-sm
            lg:hidden
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================================
          SIDEBAR
      ================================= */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen

          bg-[var(--sidebar-bg)]
          text-[var(--sidebar-text)]
          border-r border-[var(--sidebar-border)]

          flex flex-col

          transition-all duration-300 ease-in-out

          ${collapsed ? "lg:w-[84px]" : "lg:w-[260px]"}

          w-[260px]

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ================================
            LOGO SECTION
        ================================= */}
        <div
          className={`
            h-[78px]
            px-5

            flex items-center

            border-b border-[var(--sidebar-border)]

            ${collapsed ? "lg:justify-center" : "justify-between"}
          `}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Icon */}
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-[var(--sidebar-logo-bg)]

                flex items-center justify-center
                shrink-0

                shadow-lg
              "
            >
              <ShieldCheck
                size={23}
                className="text-[var(--sidebar-primary)]"
                strokeWidth={2.2}
              />
            </div>

            {/* Logo Text */}
            <div
              className={`
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              <h1
                className="
                  text-[16px]
                  font-bold
                  tracking-tight
                  whitespace-nowrap
                "
              >
                CBT Portal
              </h1>

              <p
                className="
                  text-[10px]
                  text-[var(--sidebar-muted)]
                  uppercase
                  tracking-[0.14em]
                  whitespace-nowrap
                "
              >
                Invigilator
              </p>
            </div>
          </div>

          {/* ================================
              DESKTOP COLLAPSE BUTTON
          ================================= */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden lg:flex

              w-7 h-7
              rounded-lg

              items-center justify-center

              text-[var(--sidebar-muted)]

              hover:bg-[var(--sidebar-hover)]
              hover:text-[var(--sidebar-text)]

              transition

              ${collapsed ? "lg:hidden" : ""}
            `}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={17} />
          </button>

          {/* ================================
              MOBILE CLOSE BUTTON
          ================================= */}
          <button
            onClick={() => setMobileOpen(false)}
            className="
              lg:hidden

              w-8 h-8
              rounded-lg

              hover:bg-[var(--sidebar-hover)]

              flex items-center justify-center
            "
            aria-label="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* ================================
            NAVIGATION
        ================================= */}
        <div className="flex-1 px-3 py-6 overflow-y-auto scrollbar-none">
          {/* Section Title */}
          <p
            className={`
              px-3
              mb-3

              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]

              text-[var(--sidebar-muted)]

              transition

              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            Main Menu
          </p>

          {/* Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    group relative

                    flex items-center
                    gap-3

                    px-3
                    h-[46px]

                    rounded-xl

                    transition-all duration-200

                    ${
                      isActive
                        ? `
                          bg-[var(--sidebar-active-bg)]
                          !text-[var(--sidebar-active-text)]

                          shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                        `
                        : `
                          text-[var(--sidebar-text-muted)]

                          hover:bg-[var(--sidebar-hover)]
                          hover:text-[var(--sidebar-text)]
                        `
                    }

                    ${collapsed ? "lg:justify-center lg:px-0" : ""}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* ================================
                          MENU ICON
                      ================================= */}
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.4 : 1.9}
                        className={`
                          shrink-0

                          ${
                            isActive
                              ? "!text-[var(--sidebar-active-text)]"
                              : "text-current"
                          }
                        `}
                      />

                      {/* ================================
                          MENU TEXT
                      ================================= */}
                      <span
                        className={`
                          text-[13px]
                          font-medium
                          whitespace-nowrap

                          transition-all duration-300

                          ${
                            isActive
                              ? "!text-[var(--sidebar-active-text)]"
                              : ""
                          }

                          ${collapsed ? "lg:hidden" : ""}
                        `}
                      >
                        {item.label}
                      </span>

                      {/* ================================
                          COLLAPSED TOOLTIP
                      ================================= */}
                      {collapsed && (
                        <span
                          className="
                            hidden lg:block

                            absolute
                            left-[72px]

                            px-3
                            py-2

                            rounded-lg

                            bg-[var(--sidebar-tooltip-bg)]
                            text-[var(--sidebar-tooltip-text)]

                            text-xs

                            opacity-0
                            pointer-events-none

                            group-hover:opacity-100

                            whitespace-nowrap

                            shadow-xl

                            transition

                            z-50
                          "
                        >
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ================================
            PROFILE / LOGOUT
        ================================= */}
        <div
          className="
            p-3
            border-t border-[var(--sidebar-border)]
          "
        >
          <div
            className={`
              flex items-center gap-3

              p-2.5
              rounded-xl

              bg-[var(--sidebar-profile-bg)]

              ${collapsed ? "lg:justify-center" : ""}
            `}
          >
            {/* Avatar */}
            <div
              className="
                w-9 h-9
                rounded-full

                bg-[var(--sidebar-avatar-bg)]
                border border-[var(--sidebar-avatar-border)]

                flex items-center justify-center

                shrink-0
                overflow-hidden
              "
            >
              {invigilator?.image ? (
                <img
                  src={invigilator.image}
                  alt={invigilator.name || "Invigilator"}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {invigilator?.name?.charAt(0)?.toUpperCase() || "I"}
                </span>
              )}
            </div>

            {/* User Info */}
            <div
              className={`
                min-w-0
                flex-1

                ${collapsed ? "lg:hidden" : ""}
              `}
            >
              <p
                className="
                  text-[12px]
                  font-semibold
                  truncate
                "
              >
                {invigilator?.name || "Invigilator"}
              </p>

              <p
                className="
                  text-[10px]
                  text-[var(--sidebar-muted)]
                  truncate
                "
              >
                {invigilator?.employeeId || "Employee"}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="
                w-8 h-8
                rounded-lg

                flex items-center justify-center

                text-[var(--sidebar-muted)]

                hover:text-red-300
                hover:bg-red-400/10

                transition
              "
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;