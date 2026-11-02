import axiosInstance from "./axiosInstance";

// =====================================================
// Get All Students
// =====================================================
export const getAllStudents = () => {
  return axiosInstance.get("/users/all");
};


// =====================================================
// Get Student By ID
// =====================================================
export const getStudentProfile = (id) => {
  return axiosInstance.get(`/users/${id}`);
};


// =====================================================
// Register Student
// =====================================================
export const registerStudent = (formData) => {
  return axiosInstance.post("/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


// =====================================================
// Login Student
// =====================================================
export const loginStudent = (data) => {
  return axiosInstance.post("/users/login", data);
};


// =====================================================
// Delete Student
// =====================================================
export const deleteStudent = (id) => {
  return axiosInstance.delete(`/users/${id}`);
};


// =====================================================
// Update Student
// =====================================================
export const updateStudent = (id, formData) => {
  return axiosInstance.put(`/users/${id}`, formData);
};