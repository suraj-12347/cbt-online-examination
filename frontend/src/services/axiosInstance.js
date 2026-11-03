
import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:4000/api",
   baseURL: "https://cbt-online-examination.onrender.com/api",
  
});

// Admin token automatically send hoga
axiosInstance.interceptors.request.use(
  (config) => {
  

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

