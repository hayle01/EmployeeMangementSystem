import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      useAuthStore.getState().signOut();

      if (currentPath !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);