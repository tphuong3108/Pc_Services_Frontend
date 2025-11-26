"use client";

import React from "react";
import Button from "@/components/common/Button";

interface ProductTableHeaderProps {
  onAddProduct: () => void;
  onExport?: () => void; // ✅ Optional export callback
}

export default function ProductTableHeader({ onAddProduct, onExport }: ProductTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>
        <p className="text-sm text-gray-500">Xem, chỉnh sửa và thêm sản phẩm</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        
        <Button variant="secondary" onClick={onExport}>
            📤 Xuất file
        </Button>
        
        <Button variant="primary" onClick={onAddProduct}>
          + Thêm sản phẩm
        </Button>
      </div>
    </div>
  );
}