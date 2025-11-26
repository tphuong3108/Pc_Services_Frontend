"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import BrandScreen from "./components/BrandScreen";
import HotProduct from "./components/HotProduct";
import Products from "./components/Products";
import CategoryNav from "@/components/common/CategoryNav";

export default function UserProductPageClient() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setSelectedCategory(categoryFromQuery);
  }, [categoryFromQuery]);

  return (
    <div>
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <Products category={selectedCategory} />
      <HotProduct />
      <BrandScreen />
    </div>
  );
}
