/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightCircle, Star } from "lucide-react";
import { discountService } from "@/services/discount.service";
import DefaultServiceImage from "@/assets/image/service/services.png"; // 👈 import ảnh mặc định

type ProductCard = {
  _id: string;
  title: string;
  oldPrice: number;
  price: number;
  img: string;
  slug: string;
  rating?: number;
  discount?: string;
};

type ServiceCard = {
  _id: string;
  name: string;
  price: number;
  final_price: number;
  img: string;
  slug: string;
  rating: number;
  discount: string;
};

export default function FeaturedSection() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await discountService.getAllDiscounts("product", 8, 1);
        const productCards: ProductCard[] = res
          .filter((item) => !!item.product)
          .map((item) => {
            const p = item.product!;
            return {
              _id: p._id,
              title: p.name,
              oldPrice: p.price,
              price: p.price * (1 - (item.sale_off ?? 0) / 100),
              rating: p.rating === 0 ? 5.0 : p.rating ?? 5.0,
              img: p.images?.[0]?.url || "/images/placeholder.png",
              slug: p.slug,
              discount: `${item.sale_off ?? 0}%`,
            };
          });

        setProducts(productCards.slice(0, 8));

        const serviceRes = await discountService.getAllDiscounts("service", 8, 1);
        const saleServices = serviceRes
          .filter((item) => !!item.service)
          .map((item) => {
            const s = item.service!;
            return {
              ...s,
              discount: item.sale_off ?? 0,
            };
          });
        const mappedServices: ServiceCard[] = saleServices.map((s: any) => ({
          _id: s._id,
          name: s.name,
          price: s.price,
          final_price: s.final_price || s.price,
          img: s.images?.[0]?.url || DefaultServiceImage,
          slug: s.slug,
          rating: s.avg_rating ?? 5.0,
          discount: `${s.discount}%`,
        }));

        setServices(mappedServices);
      } catch (err) {
        console.error("❌ Failed to fetch featured items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  if (loading) return <p className="text-center py-6">Đang tải...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* PRODUCTS */}
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold">Giảm giá sập sàn</h2>
          <Link
            href="/user/sales/products"
            className="text-sm text-blue-500 hover:underline flex items-center"
          >
            Xem tất cả <ChevronRightCircle className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((item) => (
            <div key={item._id} className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative">
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
                <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2">{item.title}</h3>
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
                    {(item.rating ?? 5).toFixed(1)}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold">Dịch vụ được ưa chuộng</h2>
          <Link
            href="/user/sales/services"
            className="text-sm text-blue-500 hover:underline flex items-center"
          >
            Xem tất cả <ChevronRightCircle className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((item) => (
            <div key={item._id} className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative">
              <Link href={`/user/service/detail/${item.slug}`}>
                {item.discount && (
                  <span className="absolute top-2 left-2 bg-[#FB5F2F] text-white text-xs px-2 py-1 rounded z-10">
                    {item.discount}
                  </span>
                )}
                <div className="relative w-full h-36 sm:h-40 mb-3">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    {item.final_price !== item.price ? (
                      <>
                        <span className="text-[11px] text-gray-400 line-through">
                          {item.price.toLocaleString()}₫
                        </span>
                        <span className="text-red-500 font-semibold text-sm">
                          {item.final_price.toLocaleString()}₫
                        </span>
                      </>
                    ) : (
                      <span className="text-red-500 font-semibold text-sm">
                        {item.price.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 ml-2 shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {item.rating?.toFixed(1)}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
