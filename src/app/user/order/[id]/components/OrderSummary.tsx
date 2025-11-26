/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-undef */
"use client";

import { productService } from "@/services/product.service";
import { Cart } from "@/types/Cart";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface OrderSummaryProps {
  cart: Cart;
  setCart: (cart: Cart) => void;
}

export default function OrderSummary({ cart, setCart }: OrderSummaryProps) {
  const [maxQuantity, setMaxQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchQuantities = async () => {
      const quantities: { [key: string]: number } = {};
      for (const item of cart.items) {
        try {
          const qty = await productService.getQuantity(item.product_id);
          quantities[item.product_id] = qty;
        } catch {
          quantities[item.product_id] = 0; // Nếu lỗi, đặt số lượng tối đa là 0
        }
      }
      setMaxQuantity(quantities);
    }
    fetchQuantities();
  }, [cart.items]);


  const updateQuantity = (productId: string, delta: number) => {
    const max = maxQuantity[productId] || 1;
    const updatedItems = cart.items.map((item) =>
      item.product_id === productId
      ? {
        ...item,
        quantity: Math.max(
          1,
          Math.min(item.quantity + delta, max)
        ),
        }
      : item
    );

    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
      updated_at: new Date().toISOString(),
    };
    setCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedItems = cart.items.filter(
      (item) => item.product_id !== productId
    );

    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
      updated_at: new Date().toISOString(),
    };

    setCart(updatedCart);
  };

  if (cart.items.length === 0) {
    return (
      <div className="w-full lg:w-1/3 border rounded-md p-4 bg-white">
        <p className="text-center text-gray-500">Giỏ hàng trống.</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/3 border rounded-md p-4 bg-white">
      <h3 className="text-xl font-semibold mb-4">TÓM TẮT ĐƠN HÀNG</h3>

      {cart.items.map((item) => (
        <div key={item.product_id} className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium">{item.name}</p>
            <Trash2
              onClick={() => removeItem(item.product_id)}
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-20 h-20 relative border rounded-md overflow-hidden">
              <img src={item.image} alt="..." />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm line-through">
                {(item.price * 1.1).toLocaleString("vi-VN")}₫
              </p>
              <p className="text-red-500 font-semibold text-sm">
                {item.price.toLocaleString("vi-VN")}₫ x {item.quantity}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <button
              className="w-8 h-8 border rounded-md"
              onClick={() => updateQuantity(item.product_id, -1)}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button
              className="w-8 h-8 border rounded-md"
              onClick={() => updateQuantity(item.product_id, 1)}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="border-t pt-3 flex justify-between font-medium mt-6">
        <span>TỔNG TIỀN</span>
        <span className="text-red-500">
          {cart.totalPrice.toLocaleString("vi-VN")}₫
        </span>
      </div>
    </div>
  );
}
