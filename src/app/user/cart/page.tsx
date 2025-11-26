"use client";

import { useEffect, useState } from "react";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/Cart";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "lucide-react"; // 🗑️ icon

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleOrder = () => {
    if (cart) {
      router.push(`/user/order/0`);
    } else {
      console.log("Giỏ hàng trống, không thể đặt hàng.");
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await cartService.getCart();
        setCart(data);
      } catch (err) {
        console.error("Lỗi khi tải giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemoveItem = (indexToRemove: number) => {
    if (!cart) return;
    const updatedItems = cart.items.filter((_, i) => i !== indexToRemove);
    const updatedCart = {
      ...cart,
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    };
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart_updated")); // Cập nhật global cart
  };

  if (loading) return <p className="text-center py-10">Đang tải giỏ hàng...</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link
          href="/user/product/allproduct?category=all"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90"
        >
          Mua sắm ngay
        </Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Giỏ hàng của bạn</h1>

      <div className="space-y-4">
        {cart.items.map((item, index) => (
          <div
  key={index}
  className="flex items-center justify-between p-4 border rounded shadow-sm bg-white"
>
  <Link href={`/user/product/${item.product_id}`} className="flex items-center gap-4 w-[60%]">
  {/* Cột 1: Ảnh + Tên + Số lượng */}
  <div className="flex items-center gap-4 w-[60%]">
    <Image
      src={
        item.image ||
        "https://endlessicons.com/wp-content/uploads/2012/11/image-holder-icon-614x460.png"
      }
      alt={`Product ${item.name}`}
      width={60}
      height={60}
      className="rounded"
    />
    <div>
      <p className="font-medium">Tên sản phẩm: {item.name}</p>
      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
    </div>
  </div>
  </Link>

  {/* Cột 2: Giá */}
  <div className="text-sm w-[15%] text-right">
    <p className="font-medium">
      {item.price.toLocaleString("vi-VN")}₫
    </p>
  </div>

  {/* Cột 3: Tổng */}
  <div className="text-sm w-[15%] text-right">
    <p className="text-gray-500">
      Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")}₫
    </p>
  </div>

  {/* Cột 4: Icon xóa */}
  <div className="w-[10%] text-right">
    <button
      onClick={() => handleRemoveItem(index)}
      className="text-red-600 hover:text-red-800"
      title="Xóa sản phẩm"
    >
      <Trash className="w-5 h-5" />
    </button>
  </div>
</div>

        ))}
      </div>

      <div className="mt-8 text-right">
        <p className="text-lg font-semibold">
          Tổng cộng: {cart.totalPrice.toLocaleString("vi-VN")}₫
        </p>
        <button
          onClick={handleOrder}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:opacity-90"
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
}
