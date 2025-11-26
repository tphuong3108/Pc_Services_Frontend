"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth.service";
import { useAuth } from "../../../hooks/useAuth";
import { isAxiosError } from "axios";

// Helper function to check if an error has a message property
function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === "object" && error !== null && "message" in error;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await authService.login(username, password);

      if (!data?.accessToken || !data?.user) {
        setError("Phản hồi từ server không hợp lệ");
        return;
      }

      login(data.accessToken, data.user);

      // ✅ Redirect theo role
      if (data.user.role === "admin" || data.user.role === "staff") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      console.error("Login failed", err);

      // ✅ Nếu backend trả về message cụ thể
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (isErrorWithMessage(err)) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại, vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {error && (
          <p className="mb-2 text-sm text-red-500 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring focus:border-blue-300"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring focus:border-blue-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
