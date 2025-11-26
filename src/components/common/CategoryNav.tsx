/* eslint-disable prefer-const */
"use client";

import { useRouter } from "next/navigation";
import { categoryService } from "@/services/category.service";
import { useEffect, useState, useRef } from "react";

interface CategoryItem {
  name: string;
  slug: string;
  id: string;
}

interface Props {
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function CategoryNav({ selectedCategory, onSelectCategory }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [url, setUrl] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll(20, 1);
        setCategories(
          res.categories.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            id: cat._id,
          }))
        );
        setCategories((prev) => Array(5).fill(res.categories).flat().map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          id: cat._id,
        })));

      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleClick = (cat: CategoryItem) => {
    if (onSelectCategory) onSelectCategory(cat.name);

    if (url.includes("/home")) {
      router.push(`/user/product?category=${encodeURIComponent(cat.slug)}`);
      return;
    }
    if (url.includes("detail")) {
      router.push(`/user/product?category=${encodeURIComponent(cat.slug)}`);
      return;
    }
    if (url.includes("allproduct")) {
      router.push(`/user/product?category=${encodeURIComponent(cat.slug)}`);
      return;
    }
    router.push(`?category=${encodeURIComponent(cat.slug)}`);
  };

  // ✅ Auto-scroll logic with pause on hover
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isHovered) return;

    const step = 1; // pixels per tick
    const intervalMs = 40; // speed
    let scrollInterval: NodeJS.Timeout;

    const scroll = () => {
      if (!container) return;
      container.scrollLeft += step;

      // reset to start when reaching end
      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
        container.scrollLeft = 0;
      }
    };

    scrollInterval = setInterval(scroll, intervalMs);
    return () => clearInterval(scrollInterval);
  }, [categories, isHovered]);

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hide-scrollbar flex gap-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{ scrollbarWidth: "none" }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {categories.map((c, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 cursor-pointer min-w-[64px]
                ${
                  selectedCategory === c.name
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-600"
                }`}
              onClick={() => handleClick(c)}
            >
              <span className="text-xs">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
