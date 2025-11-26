"use client";

import { Star } from "lucide-react";
import React from "react";

interface RatingProps {
  value: number; // ví dụ: 4.2
  max?: number; // mặc định: 5
  showNumber?: boolean; // có hiển thị điểm số không
  onRate?: (value: number) => void; // nếu truyền vào thì component cho phép đánh giá
  size?: number; // kích thước icon
  readonly?: boolean; // true nếu không cho click
}

export default function Rating({
  value,
  max = 5,
  showNumber = true,
  onRate,
  size = 20,
  readonly = true
}: RatingProps) {
  const rounded = Math.round(value);
  const handleClick = (index: number) => {
    if (!readonly && onRate) {
      onRate(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-[${size}px] h-[${size}px] cursor-pointer ${
            i < rounded ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          onClick={() => handleClick(i)}
        />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
