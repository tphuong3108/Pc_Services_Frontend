/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState } from "react";
import { X, Upload, FlagIcon, Trash } from "lucide-react";
import { Service } from "@/types/Service";
import { RepairRequestPayload, UploadedImage } from "@/types/Request";
import { requestService } from "@/services/request.service";

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
  if (!isOpen || !serviceData) return null;

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

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (formData.images.length + newFiles.length > 3) {
      alert("Chỉ được upload tối đa 3 ảnh.");
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
      formData.images.forEach((UploadImage, i) => {
        form.append("images", UploadImage as File);
      });

      await requestService.createRepair(formData as unknown as RepairRequestPayload);
      alert("Yêu cầu đã được gửi thành công!");
      setFormData({
        service_id: serviceData._id,
        name: "",
        email: "",
        phone: "",
        address: "",
        problem_description: "",
        repair_type: serviceData.type || "at_store",
        estimated_time: serviceData.estimated_time || "1 ngày",
        status: "new" as "new" | "in_progress" | "completed" | "cancelled",
        images: [],
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg relative p-6">
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
          {[
            { label: "Họ và tên", name: "name", type: "text" },
            { label: "Địa chỉ Email", name: "email", type: "email" },
            { label: "Số điện thoại", name: "phone", type: "tel" },
            { label: "Địa chỉ", name: "address", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={
                  typeof formData[field.name as keyof typeof formData] === "string"
                    ? (formData[field.name as keyof typeof formData] as string)
                    : ""
                }
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

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

          {/* Upload hình ảnh */}
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
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
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
