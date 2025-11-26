"use client";

import { Truck, RotateCcw, Gift, Wallet } from "lucide-react";

const benefits = [
  { title: "Miễn phí giao hàng", desc: "Với những đơn trên 9.999k", icon: Truck },
  { title: "Dễ dàng đổi trả", desc: "Với các sản phẩm 30 ngày", icon: RotateCcw },
  { title: "Những món quà đặc biệt", desc: "Tặng quà miễn phí", icon: Gift },
  { title: "Thanh toán dễ dàng", desc: "100% an toàn", icon: Wallet },
];

export default function HomeBenefits() {
  return (
    <div className=" max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 border-2 border-gray-200 rounded">
      {benefits.map((item, idx) => (
        <div key={idx} className="flex items-start space-x-3">
          <item.icon className="w-7 h-7 text-black flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <span className="text-xs text-gray-500">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
