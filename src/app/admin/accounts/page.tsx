"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";

type Profile = {
  username: string;
  password: string;
  role: string;
};

type User = {
  _id: string;
  username: string;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    username: "",
    password: "",
    role: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  // 🔹 Lấy danh sách user khi load trang
  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await userService.createAccount(profile);
      setSuccess("Tạo tài khoản thành công.");
      setProfile({ username: "", password: "", role: "" });
      fetchUsers(); // Refresh danh sách
    } catch {
      setError("Tạo tài khoản thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Xoá thất bại");
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 max-w-6xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        👥 Quản lý tài khoản người dùng
      </h1>

      {/* 2 cột song song */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái - Form tạo tài khoản */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">
            ➕ Tạo tài khoản mới
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-1 font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block mb-1 font-medium">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Chọn vai trò</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Tạo tài khoản"}
            </button>

            {error && <div className="text-red-600 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </form>
        </div>

        {/* Cột phải - Danh sách tài khoản */}
        <div className="border rounded-lg p-4 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">
            📋 Danh sách tài khoản
          </h2>
          <table className="min-w-full text-left border border-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">Username</th>
                <th className="px-4 py-2 border-b">Role</th>
                <th className="px-4 py-2 border-b text-center">Xoá</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-4 text-gray-500 border-b"
                  >
                    Không có tài khoản nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-2 border-b">{user.username}</td>
                    <td className="px-4 py-2 border-b">{user.role}</td>
                    <td className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() => handleRemove(user._id)}
                        className="text-red-600 hover:underline"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
