"use client";

import { useEffect, useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axios from "axios";

interface Info {
  terms: string;
  policy: string;
  payment: string;
  return: string;
  cookies: string;
}

export default function PdfReaderPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [selected, setSelected] = useState<"terms" | "policy" | "payment" | "return" | "cookies" | null>(null);
  const url = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const needParam = params.get("need");
      if (
        needParam === "terms" ||
        needParam === "policy" ||
        needParam === "payment" ||
        needParam === "return" ||
        needParam === "cookies"
      ) {
        setSelected(needParam);
      }
    }
  }, []);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/info");
        setInfo(res.data);
      } catch (error) {
        console.error("Failed to load info:", error);
      }
    };

    fetchInfo();
  }, []);

  if (!info) return <p className="px-4 py-10">Đang tải dữ liệu PDF...</p>;

  return (
    <div className="max-w-6xl mx-auto py-10 flex flex-col md:flex-row gap-6">
      {/* Left: Options */}
      <aside className="w-full md:w-1/4 border-r pr-4">
        <h2 className="text-lg font-semibold mb-4">📄 Danh mục</h2>
        <div className="space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded-md transition ${
              selected === "terms"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => setSelected(selected === "terms" ? null : "terms")}
          >
            📘 Điều khoản sử dụng
          </button>

          <button
            className={`w-full text-left px-4 py-2 rounded-md transition ${
              selected === "policy"
                ? "bg-green-600 text-white"
                : "hover:bg-green-50 text-gray-700"
            }`}
            onClick={() => setSelected(selected === "policy" ? null : "policy")}
          >
            📕 Chính sách
          </button>

          <button
            className={`w-full text-left px-4 py-2 rounded-md transition ${
              selected === "payment"
                ? "bg-purple-600 text-white"
                : "hover:bg-purple-50 text-gray-700"
            }`}
            onClick={() => setSelected(selected === "payment" ? null : "payment")}
          >
            📗 Chính sách thanh toán
          </button>

          <button
            className={`w-full text-left px-4 py-2 rounded-md transition ${
              selected === "return"
                ? "bg-yellow-600 text-white"
                : "hover:bg-yellow-50 text-gray-700"
            }`}
            onClick={() => setSelected(selected === "return" ? null : "return")}
          >
            📙 Chính sách đổi trả
          </button>

          <button
            className={`w-full text-left px-4 py-2 rounded-md transition ${
              selected === "cookies"
                ? "bg-red-600 text-white"
                : "hover:bg-red-50 text-gray-700"
            }`}
            onClick={() => setSelected(selected === "cookies" ? null : "cookies")}
          >
            🍪 Chính sách cookies
          </button>
        </div>
      </aside>

      {/* Right: Content */}
      <main className="w-full md:w-3/4">
        {selected === null && (
          <p className="text-gray-500 mt-10 text-center">
            👈 Chọn tài liệu ở bên trái để xem nội dung PDF.
          </p>
        )}

        {selected === "terms" && info.terms && (
          <div className="border rounded-md shadow-md overflow-hidden">
            <Worker workerUrl={url}>
              <Viewer
                fileUrl={info.terms}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}

        {selected === "policy" && info.policy && (
          <div className="border rounded-md shadow-md overflow-hidden">
            <Worker workerUrl={url}>
              <Viewer
                fileUrl={info.policy}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}

        {selected === "payment" && info.payment && (
          <div className="border rounded-md shadow-md overflow-hidden">
            <Worker workerUrl={url}>
              <Viewer
                fileUrl={info.payment}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}

        {selected === "return" && info.return && (
          <div className="border rounded-md shadow-md overflow-hidden">
            <Worker workerUrl={url}>
              <Viewer
                fileUrl={info.return}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}

        {selected === "cookies" && info.cookies && (
          <div className="border rounded-md shadow-md overflow-hidden">
            <Worker workerUrl={url}>
              <Viewer
                fileUrl={info.cookies}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}

        {selected === "terms" && !info.terms && (
          <p className="text-gray-500">Chưa có file điều khoản.</p>
        )}

        {selected === "policy" && !info.policy && (
          <p className="text-gray-500">Chưa có file chính sách.</p>
        )}

        {selected === "payment" && !info.payment && (
          <p className="text-gray-500">Chưa có file chính sách thanh toán.</p>
        )}

        {selected === "return" && !info.return && (
          <p className="text-gray-500">Chưa có file chính sách đổi trả.</p>
        )}

        {selected === "cookies" && !info.cookies && (
          <p className="text-gray-500">Chưa có file chính sách cookies.</p>
        )}
      </main>
    </div>
  );
}
