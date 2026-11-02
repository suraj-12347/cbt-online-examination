import axiosInstance from "./axiosInstance";

// Login
export const loginInvigilator = async (data) => {
  const response = await axiosInstance.post(
    "/invigilators/login",
    data
  );

  return response.data;
};

// Create invigilator
export const createInvigilator = async (data) => {
  const response = await axiosInstance.post(
    "/invigilators",
    data
  );

  return response.data;
};

// Get all invigilators
export const getAllInvigilators = async () => {
  const response = await axiosInstance.get("/invigilators");

  return response.data;
};

// Get invigilator by ID
export const getInvigilatorById = async (id) => {
  const response = await axiosInstance.get(
    `/invigilators/${id}`
  );

  return response.data;
};

// Update invigilator
export const updateInvigilator = async (id, data) => {
  const response = await axiosInstance.put(
    `/invigilators/${id}`,
    data
  );

  return response.data;
};

// Delete invigilator
export const deleteInvigilator = async (id) => {
  const response = await axiosInstance.delete(
    `/invigilators/${id}`
  );

  return response.data;
};

// Get exams assigned to invigilator
// services/invigilatorApi.js
export const getAssignedExams = async () => {
  const response = await axiosInstance.get("/invigilators/assigned-exams");
  return response.data;
};