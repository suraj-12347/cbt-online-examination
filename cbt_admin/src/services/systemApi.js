import axiosInstance from "./axiosInstance";

// =====================================================
// Create System
// =====================================================

export const createSystem = (data) => {
  return axiosInstance.post(
    "/systems",
    data
  );
};

// =====================================================
// Get All Systems
// =====================================================

export const getAllSystems = () => {
  return axiosInstance.get(
    "/systems"
  );
};

// =====================================================
// Get Available Systems
// =====================================================

export const getAvailableSystems = () => {
  return axiosInstance.get(
    "/systems/available"
  );
};

// =====================================================
// Get System By ID
// =====================================================

export const getSystemById = (id) => {
  return axiosInstance.get(
    `/systems/${id}`
  );
};

// =====================================================
// Update System
// =====================================================

export const updateSystem = (id, data) => {
  return axiosInstance.put(
    `/systems/${id}`,
    data
  );
};

// =====================================================
// Allocate System
// =====================================================

export const allocateSystemToExam = (
  systemId,
  scheduledExamId
) => {
  return axiosInstance.put(
    `/systems/${systemId}/allocate`,
    {
      scheduledExamId,
    }
  );
};

// =====================================================
// Release System
// =====================================================

export const releaseSystem = (id) => {
  return axiosInstance.put(
    `/systems/${id}/release`
  );
};

// =====================================================
// Delete System
// =====================================================

export const deleteSystem = (id) => {
  return axiosInstance.delete(
    `/systems/${id}`
  );
};