"use client";

import Image from "next/image";
import { ChevronRightCircle, Star } from "lucide-react";
import Link from "next/link";
import { serviceService } from "@/services/service.service";
import { useState, useEffect } from "react";
import { Service } from "@/types/Service";
import DefaultServiceImage from "@/assets/image/service/services.png";


export default function FeaturedFixServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [featured, setFeatured] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const res = await serviceService.getFeatured(5);
        setFeatured(res || []);
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
        const allServices = await serviceService.getAll(5, 1);
        const featureServices = allServices.services
        const mapped = featureServices
          .map((s) => ({
            ...s,
            oldPrice: s.price * (s.discount ?? 1) || 0,
            price: s.price || 0,
            rating: s.rating || 5.0,
            images: s.images?.length
              ? s.images
              : [{ url: typeof DefaultServiceImage === "string" ? DefaultServiceImage : DefaultServiceImage.src, public_id: "placeholder" }],
          }))

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
  className="flex flex-col h-full rounded-lg border border-gray-200 p-3 hover:shadow transition"
>
  <Link href={`/user/service/detail/${item.slug}`} className="flex flex-col h-full">
    {/* Ảnh */}
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 mx-auto">
      <Image
        src={item.images?.[0]?.url || "/images/placeholder.png"}
        alt={item.description || item.name || "Dịch vụ"}
        fill
        className="object-cover rounded"
      />
    </div>

    {/* Tên dịch vụ */}
    <p className="text-xs sm:text-sm text-center line-clamp-2 flex-1">{item.name}</p>

    {/* Giá + Rating */}
    <div className="flex justify-between items-center mt-auto pt-2">
      <div className="flex flex-col text-left">
        <span className="text-[11px] text-gray-400 line-through">
          {(item.price * 1.2).toLocaleString()}₫
        </span>
        <span className="text-red-500 font-semibold text-sm">
          {item.price.toLocaleString()}₫
        </span>
      </div>

      <div className="flex items-center text-xs text-gray-500 ml-2">
        <Star className="w-4 h-4 text-yellow-400 mr-1" />
        {(item.rating ?? 5.0).toFixed(1)}
      </div>
    </div>
  </Link>
</div>

        ))}
      </div>
    </div>
  );
}
