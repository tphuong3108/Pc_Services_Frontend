"use client";

import { useState } from "react";
import { X, FlagIcon, Trash } from "lucide-react";
import { Service } from "@/types/Service";
import { RepairRequestPayload, UploadedImage } from "@/types/Request";
import { requestService } from "@/services/request.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ServiceRequestModalProps {
  serviceData: Service;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceRequestModal({
  serviceData,
  isOpen,
  onClose,
}: ServiceRequestModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service_id: serviceData._id,
    name: "",
    email: "",
    phone: "",
    address: "",
    problem_description: "",
    repair_type: serviceData.type || "at_store",
    estimated_time: serviceData.estimated_time || "1 ngày",
    status: "new" as "new" | "in_progress" | "completed" | "cancelled",
    images: [] as (File | UploadedImage)[],
  });

  if (!isOpen || !serviceData) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^(?:\+84|84|0)[0-9]{9,10}$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (formData.images.length + newFiles.length > 3) {
      toast.warning("Chỉ được upload tối đa 3 ảnh.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles].slice(0, 3),
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ.");
      return;
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("service_id", formData.service_id);
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("address", formData.address);
      form.append("problem_description", formData.problem_description);
      form.append("repair_type", formData.repair_type);
      form.append("estimated_time", formData.estimated_time);
      form.append("status", formData.status);
      formData.images.forEach((img) => form.append("images", img as File));

      await requestService.createRepair(formData as unknown as RepairRequestPayload);

      toast.success("✅ Yêu cầu đã được gửi thành công!");
      setFormData({
        service_id: serviceData._id,
        name: "",
        email: "",
        phone: "",
        address: "",
        problem_description: "",
        repair_type: serviceData.type || "at_store",
        estimated_time: serviceData.estimated_time || "1 ngày",
        status: "new",
        images: [],
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      toast.error("❌ Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose} // click nền => đóng
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-lg relative p-6"
        onClick={(e) => e.stopPropagation()} // click trong form => không đóng
      >
        <button onClick={onClose} className="absolute top-3 left-3 text-gray-500">
          <FlagIcon className="w-5 h-5" />
        </button>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4 mt-4">
          ĐĂNG KÝ DỊCH VỤ SỬA CHỮA
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {["name", "email", "address"].map((name) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">
                {name === "name"
                  ? "Họ và tên"
                  : name === "email"
                    ? "Email"
                    : "Địa chỉ"}
              </label>
              <input
                type="text"
                name={name}
                value={formData[name as keyof typeof formData] as string}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                required={name !== "email"}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBeforeInput={(e) => {
                if (!/[0-9+]/.test(e.data || "")) {
                  e.preventDefault();
                }
              }}
              maxLength={13}
              inputMode="numeric"
              placeholder="+84xxxxxxxxx hoặc 0xxxxxxxxx"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              name="problem_description"
              value={formData.problem_description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả chi tiết vấn đề..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hình ảnh mô tả (tối đa 3 ảnh)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={formData.images.length >= 3}
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {formData.images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 border rounded overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(img as File)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
