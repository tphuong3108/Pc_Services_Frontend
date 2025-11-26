// src/services/auth.service.ts
import  api  from "../lib/api";

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      return res.data;
    } catch (error) {
      // Optionally handle/log error here
      throw error;
    }
  },
  logout: () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      // Optionally handle/log error here
      throw error;
    }
  },
};
