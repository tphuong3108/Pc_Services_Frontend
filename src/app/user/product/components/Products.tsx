/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRightCircle,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/Product";
import { categoryService } from "@/services/category.service";
import { ratingService } from "@/services/rating.service";

type ProductType = {
  slug: string;
  _id: string;
  title: string;
  brand?: string;
  oldPrice: number;
  price: number;
  inStock: boolean;
  discount?: string;
  rating: number;
  img: string;
  category: string;
  quantity: number;
  sale_off?: number;
};

type ProductsProps = {
  category: string;
};

const PAGE_SIZE = 10;

export default function Products({ category }: ProductsProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(String);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let products: Product[] = [];
        let totalProducts = 0;

        if (category !== "all") {
          const catRes = await categoryService.getBySlug(category);
          const category_id = catRes._id;
          setCategoryName(catRes.name);
          const res = await productService.getByCategory(
            category_id,
            PAGE_SIZE,
            page
          );
          products = res.products;
          totalProducts = res.total || 0;
        }

        const mapped = await Promise.all(
          products.map(async (p) => {
            const oldPrice = Math.round(p.price * 1.2);
            const discount =
              oldPrice > p.price
                ? `${Math.round(((oldPrice - p.price) / oldPrice) * 100)}%`
                : undefined;

            return {
              _id: p._id,
              title: p.name,
              brand: typeof p.brand === "string" ? p.brand : undefined,
              price: p.price,
              oldPrice,
              slug: p.slug,
              img: p.images?.[0]?.url || "/images/placeholder.png",
              inStock: p.status === "available",
              category:
                typeof p.category === "object"
                  ? p.category.slug
                  : p.category || "Khác",
              rating: p.rating || 5.0,
              discount: p.sale_off
                ? `Giảm ${p.sale_off}%`
                : discount,
              quantity: p.quantity,
              sale_off: p.sale_off,
            };
          })
        );

        setProducts(mapped);
        setTotal(totalProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    console.log("Total products:", products);
  }, [products]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Number pagination logic
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

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">
          {category === "all" ? "Tất cả sản phẩm" : categoryName}
        </h2>
        <Link
          href={`/user/product/allproduct?category=${encodeURIComponent(
            category
          )}`}
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          Xem thêm <ChevronRightCircle className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Grid Products */}
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
              <h3 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 mb-2 hover:text-blue-600">
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
                  {item.rating.toFixed(1)}
                </div>
              </div>
            </Link>
          </div>
        ))}

        {products.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            Chưa có sản phẩm nào trong danh mục này.
          </p>
        )}
      </div>

      {/* Numbered Pagination */}
      {renderPagination()}
    </div>
  );
}
