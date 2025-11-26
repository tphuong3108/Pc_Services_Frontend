/* eslint-disable react/no-unescaped-entities */
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { searchProducts } from '@/services/search.service';
import { Product } from '@/types/Product';
import Link from 'next/link';

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const query = params.get('query')?.toLowerCase() || '';
  const pageParam = parseInt(params.get('page') || '1');
  const [page, setPage] = useState(pageParam > 0 ? pageParam : 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(8);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // ✅ Fetch products mỗi khi query hoặc page thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await searchProducts(query, itemsPerPage, page);
        setProducts(fetchedProducts.products);
        setTotal(fetchedProducts.total);
      } catch (err) {
        console.error('❌ Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, page]);

  // ✅ Đồng bộ lại page khi người dùng quay lại hoặc đổi URL
  useEffect(() => {
    const newPage = parseInt(params.get('page') || '1');
    setPage(newPage > 0 ? newPage : 1);
  }, [params]);

  // ✅ Cập nhật URL và chuyển trang
  const handleChangePage = (newPage: number) => {
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      const searchParams = new URLSearchParams(params.toString());
      searchParams.set('page', newPage.toString());
      router.push(`?${searchParams.toString()}`);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showLeftDots = page > 3;
    const showRightDots = page < totalPages - 2;

    const start = showLeftDots ? Math.max(2, page - 1) : 2;
    const end = showRightDots ? Math.min(totalPages - 1, page + 1) : totalPages - 1;

    // ⬅ Mũi tên trái
    pages.push(
      <button
        key="prev"
        onClick={() => handleChangePage(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 transition disabled:opacity-80 disabled:cursor-not-allowed"
      >
        ←
      </button>
    );

    // Trang đầu
    pages.push(
      <button
        key={1}
        onClick={() => handleChangePage(1)}
        className={`px-2 text-lg font-medium rounded-md transition ${
          page === 1
            ? 'text-blue-600 underline'
            : 'text-gray-800 hover:bg-gray-100 dark:hover:bg-white/10'
        }`}
      >
        1
      </button>
    );

    if (showLeftDots) pages.push(<span key="dots-left">...</span>);

    // Các trang giữa
    for (let i = start; i <= end; i++) {
      if (i === 1 || i === totalPages) continue;
      pages.push(
        <button
          key={i}
          onClick={() => handleChangePage(i)}
          className={`px-2 text-lg font-medium rounded-md transition ${
            page === i
              ? 'text-blue-600 underline'
              : 'text-gray-800 hover:bg-gray-300 dark:hover:bg-white/10'
          }`}
        >
          {i}
        </button>
      );
    }

    if (showRightDots) pages.push(<span key="dots-right">...</span>);

    // Trang cuối
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handleChangePage(totalPages)}
          className={`px-2 text-lg font-medium rounded-md transition ${
            page === totalPages
              ? 'text-blue-600 underline'
              : 'text-gray-800 hover:bg-gray-300 dark:hover:bg-white/10'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // ➡ Mũi tên phải
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

  if (loading) return <p className="text-center py-8">Đang tải sản phẩm...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">
        Kết quả tìm kiếm:{" "}
        <span className="text-blue-600 font-medium">"{query}"</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => {
          const hasDiscount = (item.sale_off ?? 0) > 0;
          const finalPrice =
            item.price - (hasDiscount ? (item.price * (item.sale_off ?? 0)) / 100 : 0);
          const isOutOfStock = item.quantity === 0;

          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition relative"
            >
              <Link href={`/user/product/detail/${item.slug}`}>
                <div className="relative w-full h-40 mb-3">
                  <Image
                    src={item.images?.[0]?.url || '/images/product.png'}
                    alt={item.name}
                    fill
                    className="object-contain rounded"
                  />
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      -{item.sale_off ?? 0}%
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    {isOutOfStock ? (
                      <span className="text-gray-500 font-medium text-sm">
                        Tạm hết hàng
                      </span>
                    ) : (
                      <>
                        <span className="text-red-500 font-semibold text-sm">
                          {finalPrice.toLocaleString()}₫
                        </span>
                        {hasDiscount && (
                          <span className="text-gray-400 text-xs line-through ml-2">
                            {item.price.toLocaleString()}₫
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {typeof item.rating === 'number'
                      ? item.rating === 0
                        ? '5.0'
                        : item.rating.toFixed(1)
                      : '5.0'}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        {products.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            Không tìm thấy sản phẩm phù hợp với từ khóa.
          </p>
        )}
      </div>

      {renderPagination()}
    </div>
  );
}
