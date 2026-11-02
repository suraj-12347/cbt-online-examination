import axiosInstance from "./axiosInstance";

export const getExams = () => {
  return axiosInstance.get("/exams");
};

export const getExamById = (id) => {
  return axiosInstance.get(`/exams/${id}`);
};

export const createExam = (data) => {
  return axiosInstance.post("/exams", data);
};

export const updateExam = (id, data) => {
  return axiosInstance.put(`/exams/${id}`, data);
};

export const deleteExam = (id) => {
  return axiosInstance.delete(`/exams/${id}`);
};