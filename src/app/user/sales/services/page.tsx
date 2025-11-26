/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { discountService } from "@/services/discount.service";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import DefaultServiceImage from "@/assets/image/service/services.png";

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

const ITEMS_PER_PAGE = 8;

export default function SalesServicesPage() {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await discountService.getAllDiscounts("service", 100, 1);
        const formatted: ServiceCard[] = res
          .filter((item) => item.service)
          .map((item) => {
            const s = item.service!;
            const discount = item.sale_off ?? 0;
            const final_price = Math.round(s.price * (1 - discount / 100));
            return {
              _id: s._id,
              name: s.name,
              price: s.price,
              final_price,
              slug: s.slug,
              img:
                s.images?.[0]?.url ||
                (typeof DefaultServiceImage === "string"
                  ? DefaultServiceImage
                  : (DefaultServiceImage as any).src),
              rating: s.rating ?? 5.0,
              discount: `${discount}%`,
            };
          });
        setServices(formatted);
      } catch (err) {
        console.error("❌ Lỗi khi tải dịch vụ giảm giá:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
  const displayed = services.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return (
      <div className="flex justify-center items-center mt-8 gap-1">
        {/* Prev Button */}
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {pages.map((num, idx) =>
          typeof num === "number" ? (
            <button
              key={idx}
              onClick={() => setPage(num)}
              className={`w-8 h-8 text-sm flex items-center justify-center rounded-md
              ${num === page ? "text-blue-600 underline font-semibold" : "text-gray-800 hover:bg-gray-100"}`}
            >
              {num}
            </button>
          ) : (
            <span
              key={idx}
              className="w-8 h-8 text-sm flex items-center justify-center rounded-md text-gray-400 cursor-default"
            >
              {num}
            </span>
          )
        )}

        {/* Next Button */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dịch vụ đang giảm giá</h1>

      {loading ? (
        <p className="text-center">Đang tải dịch vụ...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((item) => (
              <div
                key={item._id}
                className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-md transition h-full relative"
              >
                <Link href={`/user/service/detail/${item.slug}`}>
                  <span className="absolute top-2 left-2 bg-[#FB5F2F] text-white text-xs px-2 py-1 rounded z-10">
                    {item.discount}
                  </span>
                  <div className="relative w-full h-36 sm:h-40 mb-3">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2">{item.name}</h3>
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
                      {(item.rating === 0 ? 5.0 : item.rating).toFixed(1)}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
}
