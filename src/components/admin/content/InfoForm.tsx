/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { infoService } from "@/services/info.services";
import { toast } from "react-toastify";
import { showConfirmToast } from "@/components/common/ConfirmToast";
import "react-toastify/dist/ReactToastify.css";

export default function FooterForm() {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    target: "",
    scope: "",
    facebook: "",
    instagram: "",
    youtube: "",
    x: "",
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [termsFile, setTermsFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [returnFile, setReturnFile] = useState<File | null>(null);
  const [cookiesFile, setCookiesFile] = useState<File | null>(null);

  const [termsProgress, setTermsProgress] = useState(0);
  const [policyProgress, setPolicyProgress] = useState(0);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [returnProgress, setReturnProgress] = useState(0);

  const phoneRegex = /^(0|\+84)[1-9][0-9]{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;


  // ✅ Load dữ liệu ban đầu
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await infoService.getInfo();
        setFormData({
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          target: data.target || "",
          scope: data.scope || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          x: data.x || "",
        });
      } catch (error) {
        toast.error("❌ Không thể tải thông tin footer.");
        console.error("Failed to fetch info", error);
      }
    };
    fetchInfo();
  }, []);

  // ⚠️ Cảnh báo khi rời trang mà chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  // 📄 Đọc file từ máy và hiển thị % tải
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "terms" | "policy" | "payment" | "return" | "cookies"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ File quá lớn. Giới hạn tối đa 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        switch (type) {
          case "terms":
            setTermsProgress(percent);
            break;
          case "policy":
            setPolicyProgress(percent);
            break;
          case "payment":
            setPaymentProgress(percent);
            break;
          case "return":
            setReturnProgress(percent);
            break;
        }
      }
    };

    reader.onloadend = () => {
      switch (type) {
        case "terms":
          setTermsFile(file);
          setTimeout(() => setTermsProgress(0), 1000);
          break;
        case "policy":
          setPolicyFile(file);
          setTimeout(() => setPolicyProgress(0), 1000);
          break;
        case "payment":
          setPaymentFile(file);
          setTimeout(() => setPaymentProgress(0), 1000);
          break;
        case "return":
          setReturnFile(file);
          setTimeout(() => setReturnProgress(0), 1000);
          break;
        case "cookies":
          setCookiesFile(file);
          break;
      }
    };

    reader.readAsArrayBuffer(file);
    setHasUnsavedChanges(true);
  };

  // 💾 Gửi form cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneRegex.test(formData.phone)) {
    toast.error("❌ Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0 hoặc +84).");
    return;
  }

  if (!emailRegex.test(formData.email)) {
    toast.error("❌ Email không hợp lệ.");
    return;
  }

    const toastId = toast.loading("Đang cập nhật thông tin...");

  try {
      await infoService.updateInfo({
        ...formData,
        termsFile: termsFile ?? undefined,
        policyFile: policyFile ?? undefined,
        paymentFile: paymentFile ?? undefined,
        returnFile: returnFile ?? undefined,
        cookiesFile: cookiesFile ?? undefined,
      });

      toast.update(toastId, {
        render: "✅ Cập nhật thông tin thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.update(toastId, {
        render: "❌ Cập nhật thất bại. Vui lòng thử lại.",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
      console.error("Cập nhật thất bại", error);
    }
  };

  // 🔙 Nút quay lại — confirm leave nếu có thay đổi
  const handleBack = async () => {
    if (!hasUnsavedChanges) {
      toast.info("Không có thay đổi để quay lại.");
      return;
    }

    const confirmLeave = await showConfirmToast({
      message: "Bạn có thay đổi chưa lưu. Rời đi sẽ mất dữ liệu. Tiếp tục?",
      confirmText: "Rời khỏi",
      cancelText: "Ở lại",
    });

    if (confirmLeave) {
      toast.info("Đã rời khỏi trang chỉnh sửa.");
      // Ví dụ: router.back() nếu bạn có router
      // router.back();
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-gray-700">THÔNG TIN LIÊN HỆ</h3>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Số điện thoại
        </label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          className="w-full rounded-md border border-gray-200 bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Nhập email"
          className="w-full rounded-md border border-gray-200 bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Địa chỉ
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Nhập địa chỉ"
          className="w-full rounded-md border border-gray-200 bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Mission & Vision */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Sứ mệnh
        </label>
        <textarea
          name="target"
          value={formData.target}
          onChange={handleChange}
          rows={3}
          placeholder="Nhập sứ mệnh"
          className="w-full rounded-md border border-gray-200 bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Tầm nhìn
        </label>
        <textarea
          name="scope"
          value={formData.scope}
          onChange={handleChange}
          rows={3}
          placeholder="Nhập tầm nhìn"
          className="w-full rounded-md border border-gray-200 bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Social Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center border rounded-md bg-gray-50 px-3">
          <FaFacebook className="text-blue-600 mr-2" />
          <input
            type="text"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            placeholder="Facebook"
            className="w-full bg-transparent p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center border rounded-md bg-gray-50 px-3">
          <FaInstagram className="text-pink-500 mr-2" />
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="Instagram"
            className="w-full bg-transparent p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center border rounded-md bg-gray-50 px-3">
          <FaTwitter className="text-sky-500 mr-2" />
          <input
            type="text"
            name="x"
            value={formData.x}
            onChange={handleChange}
            placeholder="Twitter / X"
            className="w-full bg-transparent p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center border rounded-md bg-gray-50 px-3">
          <FaYoutube className="text-red-500 mr-2" />
          <input
            type="text"
            name="youtube"
            value={formData.youtube}
            onChange={handleChange}
            placeholder="YouTube"
            className="w-full bg-transparent p-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Upload Files */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: "terms", label: "Điều khoản sử dụng", progress: termsProgress },
          { key: "policy", label: "Chính sách", progress: policyProgress },
          { key: "payment", label: "Thanh toán", progress: paymentProgress },
          { key: "return", label: "Đổi trả", progress: returnProgress },
        ].map(({ key, label, progress }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {label}
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                handleFileChange(e, key as "terms" | "policy" | "payment" | "return")
              }
              className="block w-full text-sm border border-dashed rounded-md p-2 cursor-pointer"
            />
            {progress > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="text-gray-600 text-sm font-medium hover:underline"
        >
          Quay lại
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 text-white text-sm font-medium hover:bg-blue-700"
        >
          Cập nhật
        </button>
      </div>
    </form>
  );
}
