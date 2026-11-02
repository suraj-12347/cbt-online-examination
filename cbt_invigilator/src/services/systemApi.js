import axiosInstance from "./axiosInstance";

// Create system
export const createSystem = async (data) => {
  const response = await axiosInstance.post(
    "/systems",
    data
  );

  return response.data;
};

// Get all systems
export const getAllSystems = async () => {
  const response = await axiosInstance.get("/systems");

  return response.data;
};

// Get available systems
export const getAvailableSystems = async () => {
  const response = await axiosInstance.get(
    "/systems/available"
  );

  return response.data;
};

// Get system by ID
export const getSystemById = async (id) => {
  const response = await axiosInstance.get(
    `/systems/${id}`
  );

  return response.data;
};

// Update system
export const updateSystem = async (id, data) => {
  const response = await axiosInstance.put(
    `/systems/${id}`,
    data
  );

  return response.data;
};

// Allocate system to scheduled exam
export const allocateSystemToExam = async (
  systemId,
  scheduledExamId
) => {
  const response = await axiosInstance.put(
    `/systems/${systemId}/allocate`,
    {
      scheduledExamId,
    }
  );

  return response.data;
};

// Release system
export const releaseSystem = async (id) => {
  const response = await axiosInstance.put(
    `/systems/${id}/release`
  );

  return response.data;
};

// Delete system
export const deleteSystem = async (id) => {
  const response = await axiosInstance.delete(
    `/systems/${id}`
  );

  return response.data;
};