/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import OrderBreadcrumb from "./components/OrderBreadcrumb";
import OrderForm from "./components/OrderForm";
import OrderSummary from "./components/OrderSummary";
import { Cart } from "@/types/Cart";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const [cart, setCart] = useState<Cart>({
    _id: "",
    items: [],
    totalPrice: 0,
    updated_at: "",
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const router = useRouter();

  // ✅ Load cart từ localStorage lần đầu
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed: Cart = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        }
      } catch (err) {
        console.error("Lỗi đọc cart từ localStorage:", err);
      }
    }
    setIsFirstLoad(false);
  }, []);

  // ✅ Ghi cart vào localStorage mỗi lần thay đổi
  useEffect(() => {
    if (isFirstLoad) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
  }, [cart]);

  // ✅ Chặn reload/tab close (F5, Ctrl+R, tắt tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cart.items.length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cart]);

  // ✅ Chặn chuyển trang nội bộ bằng router.push hoặc Link
  useEffect(() => {
    const originalPush = router.push;

    // Ghi đè router.push để chặn chuyển trang nếu chưa đặt hàng
    router.push = (...args: [string, ...any[]]) => {
      if (cart.items.length > 0) {
        const confirmLeave = window.confirm(
          "Bạn có chắc muốn rời khỏi trang? Đơn hàng của bạn chưa được hoàn tất."
        );
        if (!confirmLeave) return; // Hủy điều hướng nếu không đồng ý
      }
      originalPush(...args);
    };

    return () => {
      router.push = originalPush; // khôi phục lại push gốc
    };
  }, [cart, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <OrderBreadcrumb />
      <div className="flex flex-col lg:flex-row gap-8">
        <OrderForm cart={cart} setCart={setCart} />
        <OrderSummary cart={cart} setCart={setCart} />
      </div>
    </div>
  );
}
