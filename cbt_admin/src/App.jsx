import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import CreateExam from "./components/CreateExam";
import ExamDetails from "./pages/ExamDetails";
import Question from "./pages/Question";
import AddNewQuestion from "./components/AddNewQuestion";
import EditQuestion from "./components/EditQuestion";
import Section from "./pages/Section";
import ScheduleExam from "./pages/ScheduleExam";
import Students from "./pages/Students";
import AddNewStudent from "./components/AddNewStudent";
import StudentProfile from "./components/StudentProfile";
import Attempts from "./pages/Attempts";
import Result from "./pages/Results";
import ResultDetails from "./pages/ResultDetails";
import Invigilator from "./pages/Invigilotor";
import CreateInvigilator from "./pages/CreateInvigilotor";
import ScheduledExams from "./pages/ScheduledExams";
import ScheduledExamDetails from "./components/ScheduledExamDetails";
import SystemPage from "./pages/Systems";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* All routes nested inside ProtectedRoute require a token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminPage />}>
            <Route index element={<Dashboard />} />

            <Route path="exams" element={<Exams />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams/:id" element={<ExamDetails />} />

            <Route path="sections" element={<Section />} />

            <Route path="questions" element={<Question />} />
            <Route path="questions/add" element={<AddNewQuestion />} />
            <Route path="questions/edit/:id" element={<EditQuestion />} />

            <Route path="scheduled-exams" element={<ScheduledExams />} />
            <Route
              path="scheduled-exams/create"
              element={<ScheduleExam />}
            />
            <Route
              path="scheduled-exams/:id"
              element={<ScheduledExamDetails />}
            />

            <Route path="students" element={<Students />} />
            <Route path="students/create" element={<AddNewStudent />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="students/:id/edit" element={<StudentProfile />} />

            <Route path="attempts" element={<Attempts />} />

            <Route path="results" element={<Result />} />
            <Route path="results/:id" element={<ResultDetails />} />

            <Route path="invigilator" element={<Invigilator />} />
            <Route
              path="invigilators/create"
              element={<CreateInvigilator />}
            />

            <Route path="systems" element={<SystemPage />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;