import api from "@/lib/api";
// import { User } from "@/types/user";

// export const userService = {
//   getAll: () => api.get<User[]>("/users"),
//   getById: (id: string) => api.get<User>(`/users/${id}`),
//   update: (id: string, data: Partial<User>) =>
//     api.put(`/users/${id}`, data),
// };

export const userService = {
  async sendOTP(email: string) {
    try {
      return await api.post("/auth/send-otp", { email });
    } catch (error) {
      throw error;
    }
  },

  async verifyOTP(email: string, otp: string) {
    try {
      return await api.post("/auth/verify-email", { email, otp });
    } catch (error) {
      throw error;
    }
  },

  async sendEmail(email: string, subject: string, text: string) {
    try {
      return await api.post("/auth/send-email", { email, subject, text });
    } catch (error) {
      throw error;
    }
  },

  async createAccount(data: { username: string; password: string; role: string }) {
    try {
      return await api.post("/auth/register", data);
    } catch (error) {
      throw error;
    }
  },

  async getProfile() {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found in localStorage");
      }
      const user = JSON.parse(userStr);
      const userId = user._id;
      return await api.get(`/users/${userId}`);
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data: { name?: string; phone?: string; password?: string }) {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found in localStorage");
      }
      const user = JSON.parse(userStr);
      const userId = user._id;
      return await api.put(`/users/${userId}`, data);
    } catch (error) {
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const data = await api.get("/users");
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id: string) {
    try {
      return await api.delete(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  }
}