import axios from "axios";
import httpStatus from "http-status";
import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";
const USERS_API_BASE_URL =
  import.meta.env.VITE_USERS_API_BASE_URL || `${BACKEND_BASE_URL}/api/v1/users`;

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: USERS_API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("themeMode") === "dark");
  const router = useNavigate();

  const persistSession = (nextToken, user) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(nextToken);
    setUserData(user);
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUserData(null);
  };

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || token}`,
    },
  });

  const mapAuthError = (err) => {
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    const message = err?.response?.data?.message;

    if (code === "USER_NOT_FOUND" || status === httpStatus.NOT_FOUND) {
      return "User not found. Please sign up first.";
    }
    if (code === "INCORRECT_PASSWORD" || status === httpStatus.UNAUTHORIZED) {
      return "Incorrect password. Please try again.";
    }
    if (code === "USER_EXISTS" || status === httpStatus.CONFLICT) {
      return "User already exists. Please login instead.";
    }
    if (message) return message;
    return "Authentication failed. Please try again.";
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("themeMode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleRegister = async (username, email, password) => {
    try {
      const request = await client.post("/register", {
        username,
        email,
        password,
      });

      if (request.status === httpStatus.CREATED) {
        persistSession(request.data.token, request.data.user);
        router("/home");
        return request.data.message || "Signup successful";
      }

      throw new Error("Signup failed");
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === httpStatus.OK) {
        persistSession(request.data.token, request.data.user);
        router("/home");
        return request.data.message || "Login successful";
      }

      throw new Error("Login failed");
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const request = await client.get("/get_all_activity", authHeader());
      return request.data;
    } catch (err) {
      if (err?.response?.status === httpStatus.UNAUTHORIZED) {
        clearSession();
        router("/auth?mode=signin");
      }
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await client.post(
        "/add_to_activity",
        { meeting_code: meetingCode },
        authHeader()
      );
      return request;
    } catch (err) {
      if (err?.response?.status === httpStatus.UNAUTHORIZED) {
        clearSession();
        router("/auth?mode=signin");
      }
      throw err;
    }
  };

  const logout = () => {
    clearSession();
    router("/auth?mode=signin");
  };

  const updateProfile = async ({ username, avatar }) => {
    const request = await client.patch(
      "/update_profile",
      { username, avatar },
      authHeader()
    );
    if (request.status === httpStatus.OK) {
      const nextUser = request.data.user;
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUserData(nextUser);
      return request.data.message || "Profile updated";
    }
    throw new Error("Unable to update profile");
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const data = useMemo(
    () => ({
      userData,
      token,
      isDarkMode,
      isAuthenticated: Boolean(token),
      addToUserHistory,
      getHistoryOfUser,
      handleRegister,
      handleLogin,
      updateProfile,
      toggleTheme,
      logout,
    }),
    [userData, token, isDarkMode]
  );

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};