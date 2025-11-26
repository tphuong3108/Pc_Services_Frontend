/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightCircle, Star } from "lucide-react";
import { discountService } from "@/services/discount.service";
import { Product } from "@/types/Product";

type ProductCard = {
  _id: string;
  title: string;
  oldPrice: number;
  price: number;
  img: string;
  slug: string;
  rating?: number;
  discount?: string;
  quantity: number;
  sale_off?: number;
};

export default function HotProduct() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotProducts() {
      try {
        const res = await discountService.getAllDiscounts("product", 8, 1);
        const productDiscounts = res || [];

        const mappedProducts: ProductCard[] = productDiscounts
          .filter((item: any) => !!item.product)
          .map((item: any) => {
            const p = item.product!;
            return {
              _id: p._id,
              title: p.name,
              oldPrice: p.price,
              price: Math.round(p.price * (1 - (item.sale_off ?? 0) / 100)),
              rating: p.rating ?? 5.0,
              img: p.images?.[0]?.url || "/images/placeholder.png",
              slug: p.slug,
              discount: `${item.sale_off ?? 0}%`,
              quantity: p.quantity,
              sale_off: item.sale_off,
            };
          });

        setProducts(mappedProducts.slice(0, 4));
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm hot:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotProducts();
  }, []);

  if (loading) return <p className="px-4">Đang tải sản phẩm hot...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">Deal hot hôm nay 🔥</h2>
        <Link
          href="/user/product/allproduct"
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          Xem thêm <ChevronRightCircle className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((item) => (
          <div
            key={item._id}
            className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative"
          >
            <Link href={`/user/product/detail/${item.slug}`}>
              {item.discount && (
                <span className="absolute top-2 left-2 bg-[#FB5F2F] text-white text-xs px-2 py-1 rounded z-10">
                  {item.discount}
                </span>
              )}
              <div className="relative w-full h-36 sm:h-40 mb-3">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center justify-between mt-2">
                  {item.quantity === 0 ? (
                    <div className="mt-2 text-sm text-red-500 font-semibold">Tạm hết hàng</div>
                  ) : (
                    <div className="flex flex-col mt-2">
                      <div className="flex items-center gap-2">
                        {(item.sale_off ?? 0) > 0 ? (
                          <>
                            <span className="text-gray-400 text-sm line-through">
                              {item.price.toLocaleString()}₫
                            </span>
                            <span className="text-red-500 font-semibold text-sm">
                              {(item.price * (1 - (item.sale_off ?? 0) / 100)).toLocaleString()}₫
                            </span>
                          </>
                        ) : (
                          <span className="text-red-500 font-semibold text-sm">
                            {item.price.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {item.rating ? item.rating.toFixed(1) : 5.0}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 ml-2 shrink-0">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {((item.rating === 0 ? 5 : (item.rating ?? 5))).toFixed(1)}
                </div>
              </div>
            </Link>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            Không có sản phẩm hot nào.
          </p>
        )}
      </div>
    </div>
  );
}
