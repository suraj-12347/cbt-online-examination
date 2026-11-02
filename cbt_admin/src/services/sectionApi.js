import axiosInstance from "./axiosInstance";

// Get all sections
export const getSections = () => {
  return axiosInstance.get("/sections");
};

// Get sections by exam
export const getSectionsByExam = (examId) => {
  return axiosInstance.get(`/sections/exam/${examId}`);
};

// Get single section
export const getSectionById = (id) => {
  return axiosInstance.get(`/sections/${id}`);
};

// Create section
export const createSection = (data) => {
  return axiosInstance.post("/sections", data);
};

// Update section
export const updateSection = (id, data) => {
  return axiosInstance.put(`/sections/${id}`, data);
};

// Delete section
export const deleteSection = (id) => {
  return axiosInstance.delete(`/sections/${id}`);
};