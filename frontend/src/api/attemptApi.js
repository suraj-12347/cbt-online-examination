import axiosInstance from "./axiosInstance";

export const startAttempt = (data) =>
  axiosInstance.post("/attempts/start", data);

export const getAttemptById = (attemptId) =>
  axiosInstance.get(`/attempts/${attemptId}`);

export const saveAnswer = (attemptId, data) =>
  axiosInstance.post(`/attempts/${attemptId}/answer`, data);

export const markForReview = (attemptId, data) =>
  axiosInstance.post(`/attempts/${attemptId}/mark-review`, data);

export const nextSection = (attemptId) =>
  axiosInstance.post(`/attempts/${attemptId}/next-section`);

export const submitAttempt = (attemptId) =>
  axiosInstance.post(`/attempts/${attemptId}/submit`);
