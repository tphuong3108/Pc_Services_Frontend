"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  img: string;
  title: string;
  gallery: string[];
}

export default function ProductGallery({ product }: { product: Product }) {
  // State lưu index của ảnh đang được chọn
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ảnh chính = ảnh đang chọn, fallback về product.img nếu không có gallery
  const mainImage =
    product.gallery[selectedIndex] || product.img || "/images/placeholder.png";

  // xử lý chuyển trái/phải
  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? product.gallery.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setSelectedIndex((prev) =>
      prev === product.gallery.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div>
      {/* Main image */}
      <div className="w-full h-96 relative border rounded-lg mb-4 flex items-center justify-center bg-white">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-contain"
        />
      </div>

      {/* Gallery */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevImage}
          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-3 overflow-x-auto">
          {product.gallery.map((img, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndex(i)} // ✅ click vào để đổi ảnh chính
              className={`w-20 h-20 border rounded-lg relative cursor-pointer ${
                selectedIndex === i ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`thumb-${i}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>

        <button
          onClick={nextImage}
          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
