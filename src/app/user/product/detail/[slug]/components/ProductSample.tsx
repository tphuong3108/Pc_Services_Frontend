"use client";

import { useEffect, useState } from "react";
import { ChevronRightCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { Product } from "@/types/Product";

export default function ProductSample({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await productService.getRelated(productId);
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm tương tự:", err);
      }
    };
    if (productId) fetchRelated();
  }, [productId]);

  if (!products.length) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">Các sản phẩm tương tự</h2>
        <Link
          href={`/user/product/allproduct`}
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          Xem thêm <ChevronRightCircle className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Grid Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((item) => {
          const oldPrice = Math.round(item.price * 1.2);
          const discount =
            oldPrice > item.price
              ? `${Math.round(((oldPrice - item.price) / oldPrice) * 100)}%`
              : undefined;

          return (
            <div
              key={item._id}
              className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative"
            >
              <Link href={`/user/product/detail/${item.slug}`}>

                {/* Badge */}
                {discount && (
                  <span className="absolute top-2 left-2 bg-[#FB5F2F] text-white text-xs px-2 py-1 rounded z-10">
                    {discount}
                  </span>
                )}

                {/* Image */}
                <div className="relative w-full h-36 sm:h-40 mb-3">
                  <Image
                    src={item.images?.[0]?.url || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-contain rounded"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2 hover:text-blue-600">
                  {item.name}
                </h3>

                {/* Price + Rating */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400 line-through">
                      {oldPrice.toLocaleString()}₫
                    </span>
                    <span className="text-red-500 font-semibold text-sm">
                      {item.price.toLocaleString()}₫
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 ml-2 shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" /> {item.rating ? item.rating.toFixed(1) : 5.0}
                  </div>
                </div>
              </Link>

            </div>
          );
        })}
      </div>
    </div>
  );
}
