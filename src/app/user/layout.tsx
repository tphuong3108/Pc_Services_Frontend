"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Phone } from "lucide-react";
import Image from "next/image";
import Zalo from "@/assets/image/icons8-zalo.svg";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔹 Header cố định ở đầu */}
      <Header />

      {/* 🔹 Main nội dung */}
      <main className="flex-1 w-full overflow-x-hidden bg-white">
        {children}
      </main>

      {/* 🔹 Footer cuối trang */}
      <Footer />

      {/* 🔹 Nút gọi điện (góc trái dưới) */}
      <a
        href="tel:0123456789"
        className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <Phone className="w-6 h-6" />
      </a>

      {/* 🔹 Nút Zalo (góc phải dưới) */}
      <a
        href="https://zalo.me/0123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center"
      >
        <div className="w-14 h-14 relative">
          <Image src={Zalo} alt="Zalo" fill className="object-contain" />
        </div>
      </a>
    </div>
  );
}
