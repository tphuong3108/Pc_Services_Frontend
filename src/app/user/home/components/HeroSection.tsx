"use client";

import Image from "next/image";
import hero1 from "@/assets/image/product/macbook.jpg";
import hero2 from "@/assets/image/product/pin.jpg";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Banner Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Banner lớn bên trái */}
        <div className="col-span-12 md:col-span-8">
          <div className="relative w-full h-[260px] sm:h-[300px] md:h-[446px]">
            <Image
              src={hero1}
              alt="Macbook"
              fill
              className="rounded-lg shadow object-cover"
              priority
            />
            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg">
              <div className="bg-gradient-to-t from-black/10 to-transparent rounded-b-lg px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                {/* Text */}
                <div className="max-w-xs sm:max-w-sm">
                  <h2 className="text-[#CBCBCB] text-base sm:text-lg md:text-2xl font-semibold mb-1 leading-tight">
                    MacBook Pro
                  </h2>
                  <p className="mt-2 text-black text-xs sm:text-sm md:text-base leading-snug line-clamp-2">
                    Giờ đây với chip Apple M4 định nghĩa lại tốc độ, hiệu quả và hiệu suất.
                  </p>
                </div>

                {/* Button */}
                <Link href="/user/product/allproduct?category=Laptop" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base px-4 sm:px-5 py-2 rounded-md font-medium shadow shrink-0">
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Banner bên phải */}
        <div className="col-span-12 md:col-span-4">
          <div className="relative w-full h-[260px] sm:h-[300px] md:h-[446px]">
            <Image
              src={hero2}
              alt="Back To School"
              fill
              className="rounded-lg shadow object-cover"
              priority
            />
            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg">
              <div className="bg-gradient-to-t from-black/10 to-transparent rounded-b-lg px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                {/* Text */}
                <div className="max-w-xs sm:max-w-sm">
                  <h2 className="text-[#757575] text-base sm:text-lg md:text-xl font-semibold mb-1 leading-tight">
                    Dịch vụ sửa chữa
                  </h2>
                  <p className="mt-2 text-black text-xs sm:text-sm md:text-base leading-snug line-clamp-3">
                    Với dịch vụ sửa chữa chuyên nghiệp và hiện đại.
                  </p>
                </div>

                {/* Button */}
                <Link href="/user/service" className="bg-white border-2 border-blue-500 hover:bg-blue-700 hover:text-white text-blue-500 text-xs sm:text-sm md:text-base px-4 sm:px-5 py-2 rounded-md font-medium shadow shrink-0">
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
