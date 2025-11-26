"use client";

import { CheckCircle } from "lucide-react";

export default function ProductPolicies() {
  return (
    <ul className="space-y-2 text-sm text-gray-600">
      <li className="flex items-center gap-2">
        <CheckCircle className="text-green-500 w-4 h-4" /> 
        Đặt hàng trước 15:00 sẽ được giao hàng trong ngày
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle className="text-green-500 w-4 h-4" /> 
        Trả hàng dễ dàng: trong vòng 30 ngày nếu sản phẩm lỗi
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle className="text-green-500 w-4 h-4" /> 
        Bảo hành 2 năm, yên tâm khi mua hàng
      </li>
    </ul>
  );
}
