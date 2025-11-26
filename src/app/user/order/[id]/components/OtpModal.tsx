"use client";
import { useState } from "react";
import { toast } from "react-toastify";

interface OTPModalProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onSuccess: () => void; // 🔥 báo ngược cho OrderForm
  onClose: () => void;
}

export function OTPModal({ email, onVerify, onSuccess, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!otp) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }
    setLoading(true);
    const ok = await onVerify(otp);
    setLoading(false);

    if (ok) {
      toast.success("Email xác thực thành công ✅");
      onSuccess(); // 🔥 báo kết quả về OrderForm
    } else {
      setAttempts((a) => a + 1);
      setError(`Mã OTP sai (${attempts + 1}/3)`);
      if (attempts + 1 >= 3) {
        toast.error("Bạn đã nhập sai OTP quá 3 lần.");
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-80 text-center">
        <h3 className="text-lg font-semibold mb-2">Xác thực email</h3>
        <p className="text-gray-600 text-sm mb-4">
          Nhập mã OTP đã gửi đến <b>{email}</b>
        </p>
        <input
          className="border w-full text-center rounded px-3 py-2 mb-2"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            setError("");
          }}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-center gap-2">
          <button
            disabled={loading}
            onClick={handleCheck}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
          >
            {loading ? "Đang kiểm tra..." : "Xác nhận"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
