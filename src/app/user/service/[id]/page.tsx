"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { serviceService } from "@/services/service.service";
import { Service } from "@/types/Service";
import DefaultServiceImage from "@/assets/image/service/services.png";

import FeaturedFixServices from "./components/FeaturedFixServices";
import ServiceRequestModal from "./components/ServiceRequestModal";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ unwrap params
  const { id } = use(params);

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getById(id);
        setService(data);
        const views = await serviceService.countViewRedis(id);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết dịch vụ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) return <p>Đang tải chi tiết dịch vụ...</p>;
  if (!service) return <p>Không tìm thấy dịch vụ.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full h-80">
          <Image
            src={DefaultServiceImage}
            alt={service.name}
            fill
            className="object-contain"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-4">{service.name}</h1>
          <div className="flex gap-3 mb-6">
            <span className="text-gray-400 line-through">
              {new Intl.NumberFormat("vi-VN").format(service.price * 1.2)}₫
            </span>
            <span className="text-red-500 text-2xl font-semibold">
              {new Intl.NumberFormat("vi-VN").format(service.price)}₫
            </span>
          </div>
          <p className="text-gray-700 mb-6">{service.description}</p>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Yêu cầu dịch vụ
          </button>
        </div>
      </div>

      <FeaturedFixServices />

      <ServiceRequestModal serviceData = {service} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
