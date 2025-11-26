"use client";

import Image from "next/image";
import { ChevronRightCircle } from "lucide-react";
import Brand1 from "@/assets/image/brand/brand1.svg";
import Brand2 from "@/assets/image/brand/brand2.svg";
import Brand3 from "@/assets/image/brand/brand3.svg";
import Brand4 from "@/assets/image/brand/brand4.svg";
import Brand5 from "@/assets/image/brand/brand5.svg";

const brand = [
  { img: Brand1 },
  { img: Brand2 },
  { img: Brand3 },
  { img: Brand4 },
  { img: Brand5 },
];

export default function TopBrand() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        <h2 className="text-lg md:text-xl font-semibold">Top Linh Kiện</h2>
      </div>

      {/* Grid Brands */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {brand.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center rounded-lg p-4 bg-white transition cursor-pointer"
          >
            {/* Image */}
            <div className="relative w-full h-20 sm:h-24 flex items-center justify-center">
              <Image
                src={item.img}
                alt={`Brand ${idx + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
