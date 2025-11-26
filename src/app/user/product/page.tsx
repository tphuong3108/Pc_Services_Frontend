"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import BrandScreen from "./components/BrandScreen";
import HotProduct from "./components/HotProduct";
import Products from "./components/Products";
import CategoryNav from "@/components/common/CategoryNav";

export default function UserProductPage() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Đồng bộ state với query
  useEffect(() => {
    setSelectedCategory(categoryFromQuery);
  }, [categoryFromQuery]);

  return (
    <div>
      {/* Thanh category */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Danh sách sản phẩm */}
      <Products category={selectedCategory} />

      {/* Các section khác */}
      <HotProduct />
      <BrandScreen />
    </div>
  );
}
