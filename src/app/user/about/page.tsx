"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { infoService } from "@/services/info.services";
import { useEffect, useState } from "react";
import { Info } from "@/types/Info";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserAboutPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false); // trạng thái loading khi gửi form

  const phoneRegex = /^(?:\+84|84|0)[0-9]{9,10}$/;

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await infoService.getInfo();
        setInfo(data);
      } catch (err) {
        toast.error("❌ Không thể tải thông tin liên hệ.");
        console.error(err);
      }
    };
    fetchInfo();
  }, []);

  // 🔒 Cảnh báo khi reload hoặc rời trang nếu chưa gửi form
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (contact.name || contact.phone || contact.message) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contact.name.trim() || !contact.phone.trim() || !contact.message.trim()) {
      toast.error("⚠️ Vui lòng nhập đầy đủ họ tên, số điện thoại và tin nhắn.");
      return;
    }

    if (!phoneRegex.test(contact.phone)) {
      toast.error("⚠️ Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.");
      return;
    }

    if (!info?.email) {
      toast.error("❌ Không tìm thấy địa chỉ email liên hệ.");
      return;
    }

    // 🌀 Bắt đầu loading
    setLoading(true);
    const toastId = toast.loading("Đang gửi liên hệ...");

    try {
      await infoService.sendEmail(
        info.email,
        `Liên hệ từ khách hàng ${contact.name}`,
        `${contact.message}\nSố điện thoại: ${contact.phone}`
      );

      toast.update(toastId, {
        render: "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });

      setContact({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error("Lỗi khi gửi liên hệ:", err);
      toast.update(toastId, {
        render: "❌ Gửi thất bại. Vui lòng thử lại sau.",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Thông tin liên hệ */}
      <div className="bg-blue-600 text-white rounded-xl p-8 flex flex-col justify-between">
        <h2 className="text-xl font-semibold mb-6">THÔNG TIN LIÊN HỆ</h2>
        <p className="mb-6">Nói điều gì đó để bắt đầu trò chuyện trực tiếp!</p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <span>{info?.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>{info?.email}</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-1" />
            <span>{info?.address}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-20 h-20 rounded-full bg-yellow-400 opacity-80" />
        </div>
      </div>

      {/* Form liên hệ */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Liên Hệ Với Chúng Tôi</h2>
        <p className="text-gray-600 mb-6">
          Hãy để lại thông tin, chúng tôi sẽ liên hệ với bạn sớm nhất
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập họ và tên"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+84xxxxxxxxx hoặc 0xxxxxxxxx"
              value={contact.phone}
              maxLength={11}
              inputMode="numeric"
              onBeforeInput={(e) => {
                if (!/[0-9+]/.test(e.data || "")) e.preventDefault();
              }}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tin nhắn</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Gửi tin nhắn cho chúng tôi"
              value={contact.message}
              onChange={(e) => setContact({ ...contact, message: e.target.value })}
              required
            />
          </div>

          {/* 🔘 Nút gửi với vòng tròn loading */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-medium transition ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Đang gửi...</span>
              </>
            ) : (
              "Gửi"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
