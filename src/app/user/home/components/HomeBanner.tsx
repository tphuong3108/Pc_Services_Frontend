/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { bannerService } from "@/services/banner.service";

interface BannerData {
  _id: string;
  image: string;
  position: number;
  layout: string;
  link: string;
  alt: string;
}

export default function HomeBanner() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [layout, setLayout] = useState<string>("option1");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  const fetchBanners = async () => {
    try {
      const res = await bannerService.getAll(5, 1);
      const all = res.banners;

      let layoutStr = "option1";
      for (let i = 0; i < all.length; i++) {
        const item = all[i];
        const maybeLayout = item?.layout;
        if (item?.position > 0 && typeof maybeLayout === "string") {
          layoutStr = maybeLayout.toLowerCase();
          break;
        }
      }

      const valid = all
        .filter((b: any) => b.layout === layoutStr && b.position > 0)
        .sort((a: any, b: any) => a.position - b.position)
        .map((b: any) => ({
          _id: b._id,
          image: typeof b.image === "string" ? b.image : b.image?.url || "",
          position: b.position,
          layout: b.layout,
          link: b.link || "#",
          alt: b.alt || "Banner",
        }));

        let finalLayout = layoutStr;
        if (valid.length === 1) {
          finalLayout = "option2";
        } else if (valid.length === 2) {
          finalLayout = "option3";
        }

        // ✅ Nếu option1 mà màn hình nhỏ thì chuyển sang option3
        if (finalLayout === "option1" && typeof window !== "undefined") {
          if (window.innerWidth < 768) {
            finalLayout = "option3";
          }
        }

        setLayout(finalLayout);
        setBanners(valid);
      } catch (err) {
        console.error("❌ Lỗi khi tải banner:", err);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (layout !== "option3" || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [layout, banners]);

  const getBanner = (pos: number) => {
    return banners.find((b) => b.position === pos);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Option 1: 1 ảnh lớn trái, 2 ảnh nhỏ phải */}
      {layout === "option1" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8">
            <div className="relative w-full h-full aspect-[3/2] rounded-lg overflow-hidden shadow">
              {getBanner(1) && (
                <a href={getBanner(1)?.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={getBanner(1)?.image}
                    alt={getBanner(1)?.alt || "Banner 1"}
                    className="object-cover w-full h-full"
                  />
                </a>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
            {[2, 3].map((pos) => {
              const banner = getBanner(pos);
              return (
                <div
                  key={pos}
                  className="relative flex-1 w-full rounded-lg overflow-hidden shadow aspect-[3/2]"
                >
                  {banner && (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                      <img
                        src={banner.image}
                        alt={banner.alt || `Banner ${pos}`}
                        className="object-cover w-full h-full"
                      />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Option 2: 1 ảnh lớn toàn banner */}
      {layout === "option2" && (
        <div className="w-[90%] mx-auto center lg:aspect-[6/3] md:aspect-[3/1] md:w-full rounded-lg overflow-hidden shadow">
          {getBanner(1) && (
            <a href={getBanner(1)?.link} target="_blank" rel="noopener noreferrer">
              <img
                src={getBanner(1)?.image}
                alt={getBanner(1)?.alt || "Banner 1"}
                className="object-cover w-full h-full"
              />
            </a>
          )}
        </div>
      )}

      {/* Option 3: Slide ngang tự động */}
      {layout === "option3" && (
        <div className="relative w-full center mx-auto rounded-lg overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner._id} className="min-w-full lg:aspect-[16/8] md:aspect-[3/1] px-2">
                <a href={banner.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={banner.image}
                    alt={banner.alt || "Banner"}
                    className="object-cover w-full h-full rounded-lg shadow"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
