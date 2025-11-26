"use client";

import Link from "next/link";

export default function OrderBreadcrumb() {
  return (
    <div className="text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:underline">
        Trang chủ
      </Link>{" "}
      &gt;{" "}
      <span className="text-blue-600 font-medium">Yêu cầu đặt hàng</span>
    </div>
  );
}
