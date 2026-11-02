import axiosInstance from "./axiosInstance";

// =====================================================
// Schedule Exam
// Admin
// =====================================================

export const scheduleExam = (data) => {
  return axiosInstance.post("/scheduled-exams", data);
};

// =====================================================
// Get All Scheduled Exams
// Admin
// =====================================================

export const getAllScheduledExams = () => {
  return axiosInstance.get("/scheduled-exams");
};

// =====================================================
// Get Students By Exam
// Admin
// =====================================================

export const getScheduledStudentsByExam = (examId) => {
  return axiosInstance.get(
    `/scheduled-exams/exam/${examId}`
  );
};

// =====================================================
// Get Student Scheduled Exams
// Student
// =====================================================

export const getStudentScheduledExams = (studentId) => {
  return axiosInstance.get(
    `/scheduled-exams/student/${studentId}`
  );
};

// =====================================================
// Get Single Scheduled Exam
// =====================================================

export const getScheduledExamById = (id) => {
  return axiosInstance.get(
    `/scheduled-exams/${id}`
  );
};

// =====================================================
// Verify Attendance
// Invigilator
// =====================================================

export const verifyAttendance = (
  id,
  invigilatorId
) => {
  return axiosInstance.put(
    `/scheduled-exams/${id}/verify-attendance`,
    {
      invigilatorId,
    }
  );
};

// =====================================================
// Mark Absent
// Invigilator
// =====================================================

export const markAttendanceAbsent = (
  id,
  invigilatorId
) => {
  return axiosInstance.put(
    `/scheduled-exams/${id}/absent`,
    {
      invigilatorId,
    }
  );
};

// =====================================================
// Allocate System
// Invigilator
// =====================================================

export const allocateSystem = (
  id,
  systemName,
  invigilatorId
) => {
  return axiosInstance.put(
    `/scheduled-exams/${id}/allocate-system`,
    {
      systemName,
      invigilatorId,
    }
  );
};

// =====================================================
// Update Status
// Admin
// =====================================================

export const updateScheduledExamStatus = (
  id,
  status
) => {
  return axiosInstance.put(
    `/scheduled-exams/${id}/status`,
    {
      status,
    }
  );
};

// =====================================================
// Cancel Schedule
// Admin
// =====================================================

export const cancelScheduledExam = (id) => {
  return axiosInstance.delete(
    `/scheduled-exams/${id}`
  );
};

export const updateScheduledExam = (id, data) =>
  axiosInstance.put(`/scheduled-exams/${id}`, data);