import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
 
});

// Automatically attach invigilator JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("invigilatorToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized requests
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("invigilatorToken");
      localStorage.removeItem("invigilator");

      // Only redirect when we're not already on login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;