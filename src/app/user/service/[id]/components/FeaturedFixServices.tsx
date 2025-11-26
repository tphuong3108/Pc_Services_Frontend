"use client";

import Image from "next/image";
import { ChevronRightCircle, Star } from "lucide-react";
import Link from "next/link";
import { serviceService } from "@/services/service.service";
import { useState, useEffect } from "react";
import { Service } from "@/types/Service";

export default function FeaturedFixServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [featured, setFeatured] = useState<{ id: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const res = await serviceService.getFeatured(5);
        setFeatured(res.services || []);
      } catch (error) {
        console.error("Failed to fetch featured services:", error);
      }
    };
    fetchFeaturedServices();
  }, []);

  useEffect(() => {
    if (featured.length === 0) return;

    const fetchServices = async () => {
      try {
        const allServices = await serviceService.getAll();

        const mapped = allServices
          .map((s) => ({
            ...s,
            oldPrice: s.price * 1.2 || 0,
            price: s.price || 0,
            rating: 4 + Math.random(),
            images: s.images?.length
              ? s.images
              : [{ url: "/images/placeholder.png", public_id: "placeholder" }],
          }))
          .sort((a, b) => {
            const aFeatured = featured.find((f) => f.id === a._id);
            const bFeatured = featured.find((f) => f.id === b._id);

            if (aFeatured && bFeatured) return bFeatured.views - aFeatured.views;
            if (aFeatured) return -1;
            if (bFeatured) return 1;
            return 0;
          });

        setServices(mapped.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [featured]);

  if (loading) return <p className="text-center py-6">Đang tải...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Dịch vụ nổi bật</h2>
        <Link
          href="/user/service"
          className="text-sm text-blue-500 hover:underline flex items-center"
        >
          Xem tất cả <ChevronRightCircle className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {services.map((item) => (
          <div
            key={item._id}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-3 hover:shadow transition"
          >
            <Link href={`/user/service/${item._id}`}>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                <Image
                  src={item.images?.[0]?.url || "/images/placeholder.png"}
                  alt={item.description || item.name || "Dịch vụ"}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm text-center">{item.name}</p>
              {/* Price + Rating */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-400 line-through">
                    {(item.price * 1.2).toLocaleString()}₫
                  </span>
                  <span className="text-red-500 font-semibold text-sm">
                    {item.price.toLocaleString()}₫
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
