"use client";

import { toast } from "react-toastify";

interface ConfirmToastOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function showConfirmToast({
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast.info(({ closeToast }) => (
      <div>
        <p className="font-medium mb-2">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
            onClick={() => {
              resolve(true);        // ✅ Trả về true khi xác nhận
              closeToast();
            }}
          >
            {confirmText}
          </button>
          <button
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition text-sm"
            onClick={() => {
              resolve(false);       // ✅ Trả về false khi hủy
              closeToast();
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    ), {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      position: "top-center",
    });
  });
}
