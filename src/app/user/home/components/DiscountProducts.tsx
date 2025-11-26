"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightCircle, Star } from "lucide-react";
import { Product } from "@/types/Product";
import { discountService } from "@/services/discount.service";

type ProductType = {
  _id: string;
  title: string;
  oldPrice: number;
  price: number;
  discount?: string;
  rating: number;
  img: string;
  slug: string;
};

export default function DiscountProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const transitionRef = useRef(true);

  const visibleCards = 4;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const discounts = await discountService.getAllDiscounts('product', 12, 1);
        const mapped = discounts.map(d => {
          const p = d.product as Product;
          const discountPercent = d.sale_off;
          const oldPrice = p.price;
          return {
            _id: p._id,
            title: p.name,
            oldPrice,
            price: Math.round(oldPrice * (1 - discountPercent / 100)),
            discount: `${discountPercent}%`,
            rating: p.rating || 5.0,
            img: p.images?.[0]?.url || "/images/placeholder.png",
            slug: p.slug,
          };
        });
        setProducts(mapped);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi fetch sản phẩm:", err);
      }
    };
    fetchProduct();
  }, []);

  // ✅ Auto slide every 3.5s
  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => setIndex((prev) => prev + 1), 5000);
    return () => clearInterval(interval);
  }, [products]);

  // ✅ Handle reset when reaching end
  useEffect(() => {
  if (!products.length) return;

  const totalSlides = Math.ceil(products.length / visibleCards);

  // After showing the last full slide, reset
  if (index >= totalSlides) {
    transitionRef.current = false;
    const timeout = setTimeout(() => {
      setIndex(0); 
      transitionRef.current = true;
    }, 700); 
    return () => clearTimeout(timeout);
  }
}, [index, products.length]);


  if (loading) return <p className="px-4">Đang tải sản phẩm...</p>;
  if (!products.length) return null;

  const extendedProducts = [...products, ...products.slice(0, visibleCards)];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">Sản phẩm giảm giá</h2>
        <Link
          href="/user/sales"
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          Xem tất cả <ChevronRightCircle className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className={`flex ${transitionRef.current ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${index * (100 / visibleCards)}%)`,
            width: `${(extendedProducts.length * 100) / visibleCards}%`,
          }}
        >
          {extendedProducts.map((item, idx) => (
            <div key={`${item._id}-${idx}`} style={{ width: `${100 / extendedProducts.length}%` }} className="px-2 flex-shrink-0">
              <div className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative bg-white">
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
                  <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-2 hover:text-blue-600">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-400 line-through">
                        {item.oldPrice.toLocaleString()}₫
                      </span>
                      <span className="text-red-500 font-semibold text-sm">
                        {item.price.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 ml-2 shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
