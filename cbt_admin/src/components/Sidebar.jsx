
import {
  LayoutDashboard,
  FileText,
  Layers,
  HelpCircle,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    link: "/",
    roles: ["admin", "operator"],
  },
  {
    title: "Exams",
    icon: FileText,
    link: "/exams",
    roles: ["admin"],
  },
  {
    title: "Scheduled Exams",
    icon: FileText,
    link: "/scheduled-exams",
    roles: ["admin"],
  },
  {
    title: "Sections",
    icon: Layers,
    link: "/sections",
     roles: ["admin", "operator"],
  },
  {
    title: "Questions",
    icon: HelpCircle,
    link: "/questions",
    roles: ["admin", "operator"],
  },
  {
    title: "Students",
    icon: Users,
    link: "/students",
    roles: ["admin"],
  },
  {
    title: "Attempts",
    icon: ClipboardList,
    link: "/attempts",
    roles: ["admin"],
  },
  {
    title: "Results",
    icon: BarChart3,
    link: "/results",
    roles: ["admin"],
  },
  {
    title: "Invigilator",
    icon: Users,
    link: "/invigilator",
    roles: ["admin"],
  },
  {
    title: "Systems",
    icon: Layers,
    link: "/systems",
    roles: ["admin", "operator"],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
const role = (
  localStorage.getItem("role") ||
  localStorage.getItem("userRole") ||
  ""
).trim().toLowerCase();

const isAdmin = role === "admin";
const isOperator = role === "operator";

const visibleMenuItems = menuItems.filter((item) =>
  item.roles.includes(role)
);
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("operatorToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("operator");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#064273] text-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <div>
          <h1 className="text-xl font-bold">
            CBT {isOperator ? "Operator" : isAdmin ? "Admin" : "Panel"}
          </h1>
          <p className="text-xs text-blue-200">
            Management Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.link}
                end={item.link === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                <span className="text-sm font-medium">
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="shrink-0 border-t border-white/10 bg-[#064273] p-3">
        {isAdmin && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Settings size={19} className="shrink-0" />
            <span className="text-sm font-medium">
              Settings
            </span>
          </NavLink>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-200 transition-colors hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut size={19} className="shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
