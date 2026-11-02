import axiosInstance from "./axiosInstance";

// Schedule exam
export const scheduleExam = async (data) => {
  const response = await axiosInstance.post(
    "/scheduled-exams",
    data
  );

  return response.data;
};

// Get all scheduled exams
export const getAllScheduledExams = async () => {
  const response = await axiosInstance.get(
    "/scheduled-exams"
  );

  return response.data;
};

// Get students scheduled for an exam
export const getScheduledStudentsByExam = async (examId) => {
  const response = await axiosInstance.get(
    `/scheduled-exams/exam/${examId}`
  );

  return response.data;
};

// Get student's scheduled exams
export const getStudentScheduledExams = async (studentId) => {
  const response = await axiosInstance.get(
    `/scheduled-exams/student/${studentId}`
  );

  return response.data;
};

// Get scheduled exam by ID
export const getScheduledExamById = async (id) => {
  const response = await axiosInstance.get(
    `/scheduled-exams/${id}`
  );

  return response.data;
};

// Verify attendance
// Backend currently requires invigilatorId in body
export const verifyAttendance = async (
  id,
  invigilatorId
) => {
  const response = await axiosInstance.put(
    `/scheduled-exams/${id}/verify-attendance`,
    {
      invigilatorId,
    }
  );

  return response.data;
};

// Mark candidate absent
export const markAttendanceAbsent = async (
  id,
  invigilatorId
) => {
  const response = await axiosInstance.put(
    `/scheduled-exams/${id}/absent`,
    {
      invigilatorId,
    }
  );

  return response.data;
};

// Allocate system
// Backend currently requires both systemName and invigilatorId
export const allocateSystem = async (
  id,
  systemName,
  invigilatorId
) => {
  const response = await axiosInstance.put(
    `/scheduled-exams/${id}/allocate-system`,
    {
      systemName,
      invigilatorId,
    }
  );

  return response.data;
};

// Update scheduled exam status
export const updateScheduledExamStatus = async (
  id,
  status
) => {
  const response = await axiosInstance.put(
    `/scheduled-exams/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};

// Cancel scheduled exam
export const cancelScheduledExam = async (id) => {
  const response = await axiosInstance.delete(
    `/scheduled-exams/${id}`
  );

  return response.data;
};