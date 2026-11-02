import axiosInstance from "./axiosInstance";

// =====================================================
// Create Invigilator
// =====================================================

export const createInvigilator = (data) => {
  return axiosInstance.post("/invigilators", data);
};

// =====================================================
// Invigilator Login
// =====================================================

export const loginInvigilator = (data) => {
  return axiosInstance.post("/invigilators/login", data);
};

// =====================================================
// Get All Invigilators
// =====================================================

export const getAllInvigilators = () => {
  return axiosInstance.get("/invigilators");
};

// =====================================================
// Get Single Invigilator
// =====================================================

export const getInvigilatorById = (id) => {
  return axiosInstance.get(`/invigilators/${id}`);
};

// =====================================================
// Update Invigilator
// =====================================================

export const updateInvigilator = (id, data) => {
  return axiosInstance.put(`/invigilators/${id}`, data);
};

// =====================================================
// Delete Invigilator
// =====================================================

export const deleteInvigilator = (id) => {
  return axiosInstance.delete(`/invigilators/${id}`);
};

// =====================================================
// Get Assigned Exams
// =====================================================

export const getAssignedExams = (invigilatorId) => {
  return axiosInstance.get(
    `/invigilators/${invigilatorId}/assigned-exams`
  );
};