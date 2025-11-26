"use client";

import Image, { StaticImageData } from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  title: string;
  oldPrice: number;
  price: number;
  discount: string;
  rating: number;
  img: StaticImageData | string;
  slug: string;
}

export default function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/user/service/detail/${service.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {service.discount && (
        <span className="z-1 absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {service.discount}
        </span>
      )}
      <div className="relative w-full h-36 mb-3">
        <Image
          src={service.img}
          alt={service.title}
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-sm font-medium line-clamp-2 mb-2">
        {service.title}
      </h3>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-xs line-through">
            {new Intl.NumberFormat("vi-VN").format(service.oldPrice)}₫
          </span>
          <span className="text-red-500 font-semibold">
            {new Intl.NumberFormat("vi-VN").format(service.price)}₫
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 ml-2 shrink-0">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          {service.rating.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
