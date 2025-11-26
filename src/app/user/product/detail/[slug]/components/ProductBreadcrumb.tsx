"use client";

interface ProductBreadcrumbProps {
  category: string;
}

export default function ProductBreadcrumb({ category }: ProductBreadcrumbProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
      <span className="hover:underline cursor-pointer">Trang chủ</span> &gt;{" "}
      <span className="hover:underline cursor-pointer">{category}</span> &gt;{" "}
      <span className="text-gray-700">Chi tiết sản phẩm</span>
    </div>
  );
}
