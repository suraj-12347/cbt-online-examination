import axiosInstance from "./axiosInstance";

export const getStudentScheduledExams = (studentId) =>
  axiosInstance.get(`/scheduled-exams/student/${studentId}`);

export const getScheduledExamById = (scheduledExamId) =>
  axiosInstance.get(`/scheduled-exams/${scheduledExamId}`);
