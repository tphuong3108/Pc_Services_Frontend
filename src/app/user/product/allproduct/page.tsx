"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/Product";
import CategoryNav from "@/components/common/CategoryNav";
import { categoryService } from "@/services/category.service";
import { ratingService } from "@/services/rating.service";

export default function AllProductsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const category = params.get("category") || "all";
  const PAGE_SIZE = 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [category_id, setCategory_id] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(String);

  // ✅ Lấy category_id
  useEffect(() => {
    if (category === "all") {
      setCategory_id(undefined);
      return;
    }

    const fetchCategory = async () => {
      try {
        const res = await categoryService.getBySlug(category);
        setCategoryName(res.name);
        setCategory_id(res._id);
      } catch (err) {
        console.error("❌ Lỗi lấy category:", err);
      }
    };

    fetchCategory();
  }, [category]);

  // ✅ Lấy sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let result;
        if (category === "all") {
          result = await productService.getAll(PAGE_SIZE, page);
        } else if (category_id) {
          const res = await productService.getByCategory(category_id, PAGE_SIZE, page);
          result = res;
        }

        if (result) {
          setProducts(result.products);
          const totalItems = result.total || result.products.length;
          setTotalPages(Math.max(1, Math.ceil(totalItems / PAGE_SIZE)));
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, category_id, page]);

  // Đổi trang
  const handleChangePage = (newPage: number) => {
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Tạo nút phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showLeftDots = page > 3;
    const showRightDots = page < totalPages - 2;

    const start = showLeftDots ? Math.max(2, page - 1) : 2;
    const end = showRightDots ? Math.min(totalPages - 1, page + 1) : totalPages - 1;

    // 🟦 Trang đầu (1)
    pages.push(
      <button
        key={1}
        onClick={() => handleChangePage(1)}
        className={`px-2 text-lg font-medium rounded-md transition
        ${page === 1
            ? "text-blue-600 underline"
            : "text-gray-800 hover:bg-gray-100 dark:hover:bg-white/10"}
      `}
      >
        1
      </button>
    );

    // 🟨 Dấu "..."
    if (showLeftDots) pages.push(<span key="dots-left">...</span>);

    // 🟧 Các trang giữa
    for (let i = start; i <= end; i++) {
      if (i === 1 || i === totalPages) continue;
      pages.push(
        <button
          key={i}
          onClick={() => handleChangePage(i)}
          className={`px-2 text-lg font-medium rounded-md transition
          ${page === i
              ? "text-blue-600 underline"
              : "text-gray-800 hover:bg-gray-300 dark:hover:bg-white/10"}
        `}
        >
          {i}
        </button>
      );
    }

    // 🟨 Dấu "..."
    if (showRightDots) pages.push(<span key="dots-right">...</span>);

    // 🟥 Trang cuối
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handleChangePage(totalPages)}
          className={`px-2 text-lg font-medium rounded-md transition
          ${page === totalPages
              ? "text-blue-600 underline"
              : "text-gray-800 hover:bg-gray-300 dark:hover:bg-white/10"}
        `}
        >
          {totalPages}
        </button>
      );
    }

    // ➡ Nút tiếp theo
    pages.push(
      <button
        key="next"
        onClick={() => handleChangePage(page + 1)}
        disabled={page >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 transition disabled:opacity-80 disabled:cursor-not-allowed"
      >
        →
      </button>
    );

    return <div className="flex justify-center items-center gap-2 mt-8">{pages}</div>;
  };

  if (loading) return <p className="text-center py-10">Đang tải sản phẩm...</p>;

  return (
    <>
      <CategoryNav
        selectedCategory={category}
        onSelectCategory={(newCategory: string) => {
          const url = new URL(window.location.href);
          url.searchParams.set("category", newCategory);
          router.push(url.toString());
          setPage(1);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">
          {category === "all" ? "Tất cả sản phẩm" : categoryName}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item._id}
              className="relative border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
            >

              {(item.sale_off ?? 0) !== 0 && (
                <span className="absolute top-2 left-2 bg-[#FB5F2F] text-white text-xs px-2 py-1 rounded z-10">
                  {item.sale_off ?? 0}%
                </span>
              )}
              <a href={`/user/product/detail/${item.slug}`}>
                <div className="relative w-full h-40 mb-3">
                  <Image
                    src={item.images?.[0]?.url || "/images/product.png"}
                    alt={item.name}
                    fill
                    className="object-contain rounded"
                  />
                </div>
                <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
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
              </a>
            </div>
          ))}

          {products.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">
              Không có sản phẩm nào trong danh mục này.
            </p>
          )}
        </div>

        {renderPagination()}
      </div>
    </>
  );
}
