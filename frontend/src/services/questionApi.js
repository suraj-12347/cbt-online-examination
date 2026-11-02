import axiosInstance from "./axiosInstance";

// Get all questions
export const getQuestions = () => {
  return axiosInstance.get("/questions");
};

// Get questions by section
export const getQuestionsBySection = (sectionId) => {
  return axiosInstance.get(`/questions/section/${sectionId}`);
};

// Get single question
export const getQuestionById = (id) => {
  return axiosInstance.get(`/questions/${id}`);
};

// Create question
export const createQuestion = (data) => {
  return axiosInstance.post("/questions", data);
};

// Update question
export const updateQuestion = (id, data) => {
  return axiosInstance.put(`/questions/${id}`, data);
};

// Delete question
export const deleteQuestion = (id) => {
  return axiosInstance.delete(`/questions/${id}`);
};