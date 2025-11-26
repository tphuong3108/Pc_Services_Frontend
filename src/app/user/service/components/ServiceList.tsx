"use client";

import { useEffect, useState } from "react";
import { serviceService } from "@/services/service.service";
import { Service } from "@/types/Service";
import ServiceCard from "./ServiceCard";
import DefaultServiceImage from "@/assets/image/service/services.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchServices = async (currentPage: number) => {
    try {
      setLoading(true);
      const data = await serviceService.getAll(limit, currentPage);
      setServices(data.services);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(page);
  }, [page]);

  const getPaginationRange = (
    totalPages: number,
    currentPage: number,
    siblingCount = 1
  ): (number | string)[] => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 2;

    if (!showLeftDots && showRightDots) {
      const range = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
      return [...range, "...", totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const range = Array.from({ length: 3 + siblingCount * 2 }, (_, i) =>
        totalPages - (2 + siblingCount * 2) + i
      );
      return [1, "...", ...range];
    }

    if (showLeftDots && showRightDots) {
      const range = Array.from(
        { length: rightSibling - leftSibling + 1 },
        (_, i) => leftSibling + i
      );
      return [1, "...", ...range, "...", totalPages];
    }

    return [];
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <p>Đang tải dịch vụ...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Các dịch vụ sửa chữa</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {services.map((s) => (
          <ServiceCard
            key={s._id}
            service={{
              id: s._id,
              title: s.name,
              oldPrice: Math.round(s.price / 0.8),
              price: s.price,
              discount: `${s.discount} %`,
              rating: s.rating || 5.0,
              slug: s.slug,
              img:
                Array.isArray(s.images) && s.images.length > 0
                  ? s.images[0].url
                  : DefaultServiceImage,
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-600">
            Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, totalPages * limit)} dịch vụ
          </p>

          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {getPaginationRange(totalPages, page).map((p, index) => (
              <button
                key={index}
                disabled={p === "..."}
                onClick={() => typeof p === "number" && handlePageChange(p)}
                className={`w-9 h-9 text-sm flex items-center justify-center rounded-full
                  ${p === page ? "bg-blue-600 text-white font-semibold" : "text-gray-800 hover:bg-gray-100"}
                  ${p === "..." ? "cursor-default text-gray-400 w-9" : ""}
                `}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
