
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Child Pages */}
      <main className="flex-1 overflow-y-auto ml-50 pl-15">
        <Outlet />
      </main>

    </div>
  );
}

