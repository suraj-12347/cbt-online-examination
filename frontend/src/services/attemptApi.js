import axiosInstance from "./axiosInstance";

// =====================================================
// Get All Attempts
// =====================================================

export const getAllAttempts = () => {
  return axiosInstance.get("/attempts");
};

// =====================================================
// Get Attempt By ID
// =====================================================

export const getAttemptById = (id) => {
  return axiosInstance.get(`/attempts/${id}`);
};

// =====================================================
// Start Attempt
// =====================================================

export const startAttempt = (data) => {
  return axiosInstance.post("/attempts/start", data);
};

// =====================================================
// Save Answer
// =====================================================

export const saveAnswer = (id, data) => {
  return axiosInstance.post(
    `/attempts/${id}/answer`,
    data
  );
};

// =====================================================
// Mark / Unmark Review
// =====================================================

export const markForReview = (id, data) => {
  return axiosInstance.post(
    `/attempts/${id}/mark-review`,
    data
  );
};

// =====================================================
// Submit Attempt
// =====================================================

export const submitAttempt = (id) => {
  return axiosInstance.post(
    `/attempts/${id}/submit`
  );
};

// =====================================================
// Expire Attempt
// =====================================================

export const expireAttempt = (id) => {
  return axiosInstance.post(
    `/attempts/${id}/expire`
  );
};