import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { loginInvigilator } from "../services/invigilatorApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [invigilator, setInvigilator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login session
  useEffect(() => {
    const storedInvigilator =
      localStorage.getItem("invigilator");

    const token =
      localStorage.getItem("invigilatorToken");

    if (storedInvigilator && token) {
      try {
        setInvigilator(
          JSON.parse(storedInvigilator)
        );
      } catch (error) {
        console.error(
          "Failed to restore invigilator session:",
          error
        );

        localStorage.removeItem("invigilator");
        localStorage.removeItem("invigilatorToken");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await loginInvigilator({
      email,
      password,
    });

    if (!response?.success) {
      throw new Error(
        response?.message || "Login failed"
      );
    }

    const token = response.token;
    const user = response.invigilator;

    localStorage.setItem(
      "invigilatorToken",
      token
    );

    localStorage.setItem(
      "invigilator",
      JSON.stringify(user)
    );

    setInvigilator(user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem("invigilatorToken");
    localStorage.removeItem("invigilator");

    setInvigilator(null);
  };

  const isAuthenticated =
    Boolean(invigilator) &&
    Boolean(
      localStorage.getItem("invigilatorToken")
    );

  const value = {
    invigilator,
    setInvigilator,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;