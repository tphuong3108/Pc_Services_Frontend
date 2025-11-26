'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { searchProducts } from '@/services/search.service';
import { Product } from '@/types/Product';
import Link from 'next/link';

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get('query')?.toLowerCase() || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ Đúng thứ tự: query, page, limit
        const fetchedProducts = await searchProducts(query, currentPage, itemsPerPage);
        console.log('Fetched products:', fetchedProducts);
        setProducts(fetchedProducts.products);
        setTotal(fetchedProducts.total);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, itemsPerPage, currentPage]);

  // Reset trang về 1 khi query thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  if (loading) {
    return <p className="text-center py-8">Đang tải sản phẩm...</p>;
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    console.log('Current page:', currentPage, 'Total pages:', totalPages);
    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {/* Prev button */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'hover:bg-blue-50 text-blue-600 border-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered pages */}
        {pages.map((page, idx) =>
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full border text-sm transition ${
                page === currentPage
                  ? 'bg-blue-100 text-blue-600 border-blue-400 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-1 text-gray-400">
              {page}
            </span>
          )
        )}

        {/* Next button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'hover:bg-blue-50 text-blue-600 border-gray-300'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">
        Kết quả tìm kiếm:{' '}
        <span className="text-blue-600 font-medium">`{query}`</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
          >
            <Link href={`/user/product/detail/${item.slug}`}>
              <div className="relative w-full h-40 mb-3">
                <Image
                  src={item.images?.[0]?.url || '/images/product.png'}
                  alt={item.name}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-red-500 font-semibold text-sm">
                  {item.price ? item.price.toLocaleString() : '—'}₫
                </span>
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  4.5
                </div>
              </div>
            </Link>
          </div>
        ))}

        {products.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            Không tìm thấy sản phẩm phù hợp với từ khóa.
          </p>
        )}
      </div>

      {/* ✅ Gọi pagination */}
      {renderPagination()}
    </div>
  );
}
