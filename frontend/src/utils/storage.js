export const getStudentId = () => {
  return localStorage.getItem("studentId");
};

export const setStudentId = (studentId) => {
  localStorage.setItem("studentId", studentId);
};

export const getStudentToken = () => {
  return localStorage.getItem("studentToken");
};

export const clearStudentSession = () => {
  localStorage.removeItem("studentId");
  localStorage.removeItem("studentToken");
  localStorage.removeItem("attemptId");
};
