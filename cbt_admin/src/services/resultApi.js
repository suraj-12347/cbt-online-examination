import axiosInstance from "./axiosInstance";

// =====================================================
// Get All Results
// =====================================================

export const getAllResults = () => {
  return axiosInstance.get("/results");
};

// =====================================================
// Get Result By ID
// =====================================================

export const getResultById = (id) => {
  return axiosInstance.get(`/results/id/${id}`);
};

// =====================================================
// Get Result By Attempt ID
// =====================================================

export const getResultByAttempt = (attemptId) => {
  return axiosInstance.get(`/results/${attemptId}`);
};

// =====================================================
// Calculate Result
// =====================================================

export const calculateResult = (attemptId) => {
  return axiosInstance.post(
    `/results/${attemptId}/calculate`
  );
};